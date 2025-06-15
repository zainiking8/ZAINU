const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "mahadev",
  version: "2.0.0",
  credits: "Rudra",
  description: "Mahadev swag reply with mantra & video",
  commandCategory: "religious",
  usePrefix: false,
  cooldowns: 5,
  triggerWords: ["mahadev", "shiv", "baba", "bhole", "har har mahadev", "bam"]
};

module.exports.run = async function ({ api, event }) {
  const { threadID, body } = event;
  const triggers = module.exports.config.triggerWords;

  if (!triggers.some(t => body?.toLowerCase().includes(t))) return;

  const videoLinks = [
    "https://i.imgur.com/DbzplKX.mp4",
    "https://i.imgur.com/KUhRKEi.mp4",
    "https://i.imgur.com/eQNdprV.mp4",
    "https://i.imgur.com/FHzHB2T.mp4"
  ];

  const messages = [
    "🚩 *BAM BAM BHOLE!* 🔥\nJisne Shiv ko jaana, usne sab paaya!",
    "🕉️ *Om Namah Shivaya!*\nBholenath ki kripa sab par bani rahe 🙏",
    "🔱 *Mahadev se bada na koi...*\nBhakti bhi usi ki, shakti bhi usi ki.",
    "🌊 *Bhakti me josh ho to...*\n🚩 *Naam lo Bholenath ka!*"
  ];

  const selectedVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];
  const selectedMsg = messages[Math.floor(Math.random() * messages.length)];
  const ext = path.extname(selectedVideo);
  const tempFile = path.join(__dirname, `mahadevMedia${ext}`);

  try {
    const res = await axios.get(selectedVideo, { responseType: "arraybuffer" });
    fs.writeFileSync(tempFile, res.data);

    api.sendMessage({
      body: selectedMsg,
      attachment: fs.createReadStream(tempFile)
    }, threadID, () => fs.unlinkSync(tempFile));
  } catch (err) {
    console.error("❌ Media error:", err.message);
    api.sendMessage("⚠️ Mahadev video bhejne me dikkat ho gayi bhai.", threadID);
  }
};
