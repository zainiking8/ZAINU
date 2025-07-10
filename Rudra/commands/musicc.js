const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 10000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) console.log(`🧹 Deleted: ${filePath}`);
      });
    }
  }, timeout);
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

module.exports = {
  config: {
    name: "music",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube MP3/MP4 with thumbnail and info",
    commandCategory: "media",
    usages: "music <query> | music video <query>",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("🎵 Gana ka naam to likho! 😐", event.threadID);

    const isVideo = args[0].toLowerCase() === "video";
    const query = isVideo ? args.slice(1).join(" ") : args.join(" ");
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=AIzaSyAGQrBQYworsR7T2gu0nYhLPSsi2WFVrgQ`;

    try {
      const searchRes = await axios.get(searchUrl);
      if (!searchRes.data.items.length) throw new Error("❌ Gana nahi mila.");

      const video = searchRes.data.items[0];
      const videoId = video.id.videoId;
      const videoUrl = `https://youtu.be/${videoId}`;

      const apiUrl = isVideo
        ? `https://dev-priyanshi.onrender.com/api/ytmp4dl?url=${encodeURIComponent(videoUrl)}&quality=480`
        : `https://dev-priyanshi.onrender.com/api/ytmp3dl?url=${encodeURIComponent(videoUrl)}&quality=128`;

      const dataRes = await axios.get(apiUrl);
      const { metadata, download } = dataRes.data.data;

      const {
        title,
        thumbnail,
        duration,
        author,
        views,
        seconds
      } = metadata;

      const thumbUrl = thumbnail;
      const thumbExt = thumbUrl.endsWith(".png") ? "png" : "jpg";
      const thumbPath = path.join(__dirname, "cache", `${videoId}.${thumbExt}`);

      const thumbStream = fs.createWriteStream(thumbPath);
      const thumbDownload = await axios({ url: thumbUrl, responseType: "stream" });
      await new Promconst axios = require("axios");
const fs = require("fs");
const path = require("path");

function deleteAfterTimeout(filePath, timeout = 60000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) console.log(`🧹 Deleted file: ${filePath}`);
      });
    }
  }, timeout);
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

module.exports = {
  config: {
    name: "music",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube audio/video by query",
    commandCategory: "Media",
    usages: "music <query> | music video <query>",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("🎵 Gana ka naam to likho! 😐", event.threadID);

    const isVideo = args[0].toLowerCase() === "video";
    const query = isVideo ? args.slice(1).join(" ") : args.join(" ");
    const processingMessage = await api.sendMessage(`🔍 "${query}" dhoondh rahi hoon...`, event.threadID);

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=AIzaSyAGQrBQYworsR7T2gu0nYhLPSsi2WFVrgQ`;

    try {
      const searchRes = await axios.get(searchUrl);
      if (!searchRes.data.items.length) throw new Error("❌ Gana nahi mila.");

      const video = searchRes.data.items[0];
      const videoId = video.id.videoId;
      const videoUrl = `https://youtu.be/${videoId}`;

      const apiUrl = isVideo
        ? `https://dev-priyanshi.onrender.com/api/ytmp4dl?url=${encodeURIComponent(videoUrl)}&quality=480`
        : `https://dev-priyanshi.onrender.com/api/ytmp3dl?url=${encodeURIComponent(videoUrl)}&quality=128`;

      const dataRes = await axios.get(apiUrl);
      const { metadata, download } = dataRes.data.data;

      const {
        title,
        thumbnail,
        duration,
        author,
        views,
        seconds
      } = metadata;

      const thumbUrl = thumbnail;
      const thumbExt = thumbUrl.endsWith(".png") ? "png" : "jpg";
      const thumbPath = path.join(__dirname, "cache", `${videoId}.${thumbExt}`);

      const thumbStream = fs.createWriteStream(thumbPath);
      const thumbDownload = await axios({ url: thumbUrl, responseType: "stream" });
      await new Promise((resolve, reject) => {
        thumbDownload.data.pipe(thumbStream);
        thumbStream.on("finish", resolve);
        thumbStream.on("error", reject);
      });

      await api.sendMessage({
        body:
          `🎵 ${isVideo ? "🎥 Video" : "🎧 Audio"} Info:\n\n` +
          `📌 Title: ${title}\n` +
          `📺 Channel: ${author.name}\n` +
          `👁️ Views: ${formatNumber(views)}\n` +
          `⏱️ Duration: ${formatDuration(seconds)}\n\n` +
          `🔗 ${videoUrl}`,
        attachment: fs.createReadStream(thumbPath),
      }, event.threadID, () => deleteAfterTimeout(thumbPath), event.messageID);

      const fileUrl = download.url;
      const format = isVideo ? "mp4" : "mp3";
      const safeTitle = title.replace(/[^\w\s]/gi, "_").slice(0, 30);
      const filePath = path.join(__dirname, "cache", `${safeTitle}.${format}`);

      const mediaRes = await axios({
        url: fileUrl,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      mediaRes.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage({
        attachment: fs.createReadStream(filePath),
      }, event.threadID, event.messageID);

      deleteAfterTimeout(filePath, 60000);

    } catch (err) {
      console.error(err.message);
      api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  },
};ise((resolve, reject) => {
        thumbDownload.data.pipe(thumbStream);
        thumbStream.on("finish", resolve);
        thumbStream.on("error", reject);
      });

      await api.sendMessage({
        body:
          `🎵 ${isVideo ? "🎥 Video" : "🎧 Audio"} Info:\n\n` +
          `📌 Title: ${title}\n` +
          `📺 Channel: ${author.name}\n` +
          `👁️ Views: ${formatNumber(views)}\n` +
          `⏱️ Duration: ${formatDuration(seconds)}\n\n` +
          `🔗 ${videoUrl}`,
        attachment: fs.createReadStream(thumbPath),
      }, event.threadID, () => deleteAfterTimeout(thumbPath), event.messageID);

      const fileUrl = download.url;
      const format = isVideo ? "mp4" : "mp3";
      const safeTitle = title.replace(/[^\w\s]/gi, "_").slice(0, 30);
      const filePath = path.join(__dirname, "cache", `${safeTitle}.${format}`);
      const fileStream = fs.createWriteStream(filePath);

      await new Promise((resolve, reject) => {
        https.get(fileUrl, (res) => {
          if (res.statusCode === 200) {
            res.pipe(fileStream);
            fileStream.on("finish", () => {
              fileStream.close(resolve);
            });
          } else {
            reject(new Error("❌ File download failed"));
          }
        }).on("error", reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage({
        attachment: fs.createReadStream(filePath),
      }, event.threadID, event.messageID);

      deleteAfterTimeout(filePath, 10000);

    } catch (err) {
      console.error(err.message);
      api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  },
};
