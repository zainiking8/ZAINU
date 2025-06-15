const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "mahadev",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rudra",
  description: "Send random Mahadev bhakti videos",
  usePrefix: false,
  commandCategory: "noPrefix",
  triggerWords: ["mahadev", "shiv", "bhole baba", "har har mahadev", "bam"]
};

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

module.exports.handleEvent = async ({ api, event }) => {
  const content = event.body?.toLowerCase();
  const triggers = module.exports.config.triggerWords;

  if (!triggers.some(word => content.includes(word))) return;

  const selectedVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];
  const selectedMsg = bhaktiMessages[Math.floor(Math.random() * bhaktiMessages.length)];
  const tempFile = path.join(__dirname, "mahadevMedia.mp4");

  try {
    const res = await axios.get(selectedVideo, { responseType: "arraybuffer" });
    fs.writeFileSync(tempFile, res.data);

    api.sendMessage({
      body: selectedMsg,
      attachment: fs.createReadStream(tempFile)
    }, event.threadID, () => fs.unlinkSync(tempFile));
    
  } catch (err) {
    console.error("❌ Video download/send error:", err.message);
    api.sendMessage("⚠️ Bhole ka video load nahi ho paya bhai 🙏", event.threadID);
  }
};
