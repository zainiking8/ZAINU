const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "mahadev",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rudra",
  description: "Mahadev swag video with bhakti message",
  usePrefix: false,
  commandCategory: "noPrefix",
};

const triggerWords = ["mahadev", "har har mahadev", "shiv", "bhole baba", "bam"];
const videoLinks = [
  "https://i.imgur.com/DbzplKX.mp4",
  "https://i.imgur.com/KUhRKEi.mp4",
  "https://i.imgur.com/eQNdprV.mp4",
  "https://i.imgur.com/FHzHB2T.mp4"
];
const bhaktiMessages = [
  "🔱 Har Har Mahadev! Bhakti ka asli swag yahi hai!",
  "🚩 Jai Bhole Baba! Rudra mode ON 🔥",
  "🕉️ Shiv ka naam le, kaam sab theek ho jaega 💪",
  "🙌 Bhakti bhi meri, swag bhi mera - Rudra ke saath!",
  "⚡ Bam Bam Bhole! Trishul ki taal pe zindagi chalti hai!",
  "🌪️ Om Namah Shivay! Rudra style me bhakti ka blast 💥"
];

module.exports.handleEvent = async function ({ api, event }) {
  const msgBody = event.body?.toLowerCase();
  if (!msgBody || !triggerWords.some(word => msgBody.includes(word))) return;

  const selectedVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];
  const selectedMessage = bhaktiMessages[Math.floor(Math.random() * bhaktiMessages.length)];
  const tempPath = path.join(__dirname, "mahadev_temp.mp4");

  try {
    const res = await axios.get(selectedVideo, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, res.data);

    api.sendMessage({
      body: selectedMessage,
      attachment: fs.createReadStream(tempPath)
    }, event.threadID, () => fs.unlinkSync(tempPath));
  } catch (err) {
    console.log("❌ Error loading video:", err.message);
    api.sendMessage("⚠️ Bhole Nath ka swag load nahi ho paaya 🙏", event.threadID);
  }
};
