const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const API_KEY = "AIzaSyAGQrBQYworsR7T2gu0nYhLPSsi2WFVrgQ";

function deleteAfterTimeout(filePath, timeout = 10000) {
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

function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
}

module.exports = {
  config: {
    name: "ytsong",
    version: "2.2.3",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song or video",
    commandCategory: "Media",
    usages: "[songName] [optional: video]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Gaane ka naam to likho na! 😒", event.threadID);
    }

    const mediaType = args[args.length - 1].toLowerCase() === "video" ? "video" : "audio";
    const songName = mediaType === "video" ? args.slice(0, -1).join(" ") : args.join(" ");

    const processingMessage = await api.sendMessage(
      `🔍 "${songName}" dhoondh rahi hoon... Ruko zara! 😏`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(songName)}&maxResults=1&type=video&key=${API_KEY}`;
      const searchResponse = await axios.get(searchUrl);
      
      if (!searchResponse.data.items.length) {
        throw new Error("Kuch nahi mila! Gaane ka naam sahi likho. 😑");
      }
      
      const video = searchResponse.data.items[0];
      const videoId = video.id.videoId;
      
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoId}&key=${API_KEY}`;
      const detailsResponse = await axios.get(detailsUrl);
      const details = detailsResponse.data.items[0];
      
      const title = video.snippet.title;
      const channelTitle = video.snippet.channelTitle;
      const thumbnailUrl = video.snippet.thumbnails.high.url;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const likes = details.statistics.likeCount || "N/A";
      const comments = details.statistics.commentCount || "N/A";
      const duration = formatDuration(details.contentDetails.duration);
      
      const thumbnailExt = thumbnailUrl.endsWith(".png") ? "png" : "jpg";
      const thumbnailPath = path.join(__dirname, "cache", `${videoId}.${thumbnailExt}`);
      const thumbnailResponse = await axios({ url: thumbnailUrl, responseType: "stream" });
      const thumbnailStream = fs.createWriteStream(thumbnailPath);
      await new Promise((resolve, reject) => {
        thumbnailResponse.data.pipe(thumbnailStream);
        thumbnailStream.on("finish", resolve);
        thumbnailStream.on("error", reject);
      });
      
      await api.sendMessage(
        {
          body: `🎶 **Title:** ${title}\n📺 **Channel:** ${channelTitle}\n👍 **Likes:** ${likes}\n💬 **Comments:** ${comments}\n⏳ **Duration:** ${duration}\n👀 Song load ho raha hai, ruko zara! 😘`,
          attachment: fs.createReadStream(thumbnailPath),
        },
        event.threadID
      );
      
      deleteAfterTimeout(thumbnailPath, 10000);
      
      const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=${mediaType}`;
      const downloadResponse = await axios.get(apiUrl);

      if (!downloadResponse.data.file_url) {
        throw new Error("Download fail ho gaya. 😭");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.${mediaType === "video" ? "mp4" : "mp3"}`;
      const downloadPath = path.join(__dirname, "cache", filename);
      
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
          body: `🎵 **Aapka ${mediaType === "video" ? "Video 🎥" : "Gaana 🎧"} taiyaar hai!**\nEnjoy! 😍`,
        },
        event.threadID,
        event.messageID
      );

      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID, event.messageID);
    }
  },
};
