const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 5000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log(`✅ Deleted file: ${filePath}`);
        } else {
          console.error(`❌ Error deleting file: ${err.message}`);
        }
      });
    }
  }, timeout);
}

const downloadDir = path.join(__dirname, "cache");
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

let searchResultsCache = {}; // Store search results for direct selection

module.exports = {
  config: {
    name: "play",
    version: "3.3.0",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Choose YouTube song by number (without handleReply)",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Gaane ka naam to likho na! 😒", event.threadID);
    }

    const songName = args.join(" ");

    try {
      const searchResults = await ytSearch(songName);
      if (!searchResults || searchResults.videos.length < 1) {
        throw new Error("Kuch nahi mila! Gaane ka naam sahi likho. 😑");
      }

      const topResults = searchResults.videos.slice(0, 7);
      searchResultsCache[event.threadID] = topResults; // Store search results per thread

      let mediaData = [];
      let searchReply = `📌 **Choose a song number (1-7):**\n\n`;

      for (let i = 0; i < topResults.length; i++) {
        const video = topResults[i];
        searchReply += `🎵 ${i + 1}. ${video.title} (${video.timestamp})\n\n`;

        const thumbnailUrl = video.thumbnail;
        const thumbPath = path.join(downloadDir, `thumb_${i + 1}.jpg`);

        try {
          const writer = fs.createWriteStream(thumbPath);
          const response = await axios({ url: thumbnailUrl, responseType: "stream" });
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          mediaData.push(fs.createReadStream(thumbPath));
          deleteAfterTimeout(thumbPath, 5000);
        } catch (error) {
          console.error(`❌ Thumbnail Download Error: ${error.message}`);
        }
      }

      searchReply += `🔢 **Reply with a number (1-7) to select a song!**`;

      api.sendMessage({ body: searchReply, attachment: mediaData }, event.threadID);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID, event.messageID);
    }
  },

  handleEvent: async function ({ api, event }) {
    const message = event.body.trim();
    if (!/^[1-7]$/.test(message)) return;

    const threadID = event.threadID;
//empty

    const choice = parseInt(message);
    const selectedVideo = searchResultsCache[threadID][choice - 1];
    const videoUrl = `https://www.youtube.com/watch?v=${selectedVideo.videoId}`;
    const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=audio`;

    delete searchResultsCache[threadID]; // Remove from cache after selection

    const processingMessage = await api.sendMessage(
      `🎵 **Title:** ${selectedVideo.title}\n⏳ **Processing...**`,
      threadID
    );

    try {
      const downloadResponse = await axios.get(apiUrl);
      if (!downloadResponse.data.file_url) {
        throw new Error("Download fail ho gaya. 😭");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");
      const safeTitle = selectedVideo.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.mp3`;
      const downloadPath = path.join(downloadDir, filename);

      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Download fail ho gaya. Status: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎶 **Title:** ${selectedVideo.title}\nLijiye! Aapka pasandida gaana! 😍`,
        },
        threadID
      );

      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, threadID);
    }
  },
};
