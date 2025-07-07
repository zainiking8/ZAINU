const axios = require("axios");
const fs = require("fs");
const path = require("path");

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

module.exports = {
  config: {
    name: "youtube",
    version: "2.2.4",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Search YouTube videos and get details",
    commandCategory: "Search",
    usages: "[videoName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Video ka naam to likho na! 😒", event.threadID);
    }

    const videoName = args.join(" ");

    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(videoName)}&maxResults=7&type=video&key=${API_KEY}`;
      const searchResponse = await axios.get(searchUrl);

      if (!searchResponse.data.items.length) {
        throw new Error("Kuch nahi mila! Video ka naam sahi likho. 😑");
      }

      let message = "🎬 **Search Results:**\n";
      searchResponse.data.items.forEach((video, index) => {
        message += `\n${index + 1}. ${video.snippet.title}`;
      });

      message += "\n\n🧐 **Choose a number from 1–7 to get video details.**";

      return api.sendMessage(message, event.threadID, async (err, info) => {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          data: searchResponse.data.items,
        });
      });

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID, event.messageID);
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { author, messageID, data } = handleReply;
    if (event.senderID !== author) return;

    const choice = parseInt(event.body.trim());
    if (isNaN(choice) || choice < 1 || choice > data.length) {
      return api.sendMessage("⚠️ Sahi number bhejo bhai!", event.threadID);
    }

    const video = data[choice - 1];
    const videoId = video.id.videoId;

    try {
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

      const ext = thumbnailUrl.endsWith(".png") ? "png" : "jpg";
      const imgPath = path.join(__dirname, "cache", `${videoId}.${ext}`);
      const imgRes = await axios({ url: thumbnailUrl, responseType: "stream" });
      const stream = fs.createWriteStream(imgPath);

      await new Promise((resolve, reject) => {
        imgRes.data.pipe(stream);
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      // First message: only video link
      await api.sendMessage(`🔗 ${videoUrl}`, event.threadID);

      // Second message: video details with thumbnail
      await api.sendMessage({
        body: `🎬 **Title:** ${title}\n📺 **Channel:** ${channelTitle}\n👍 **Likes:** ${likes}\n💬 **Comments:** ${comments}\n⏳ **Duration:** ${duration}`,
        attachment: fs.createReadStream(imgPath),
      }, event.threadID);

      deleteAfterTimeout(imgPath);

    } catch (err) {
      console.error("❌ Details Error:", err.message);
      return api.sendMessage("❌ Video details laane mein dikkat ho gayi.", event.threadID);
    }
  }
};

function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
}
