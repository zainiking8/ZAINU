// 🔱 sanatani.js - Sanatani Pro Max (No Prefix, Borders, Image/Video)
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const triggerWords = [
  "hello", "hi", "radhe radhe", "jai shree ram",
  "har har mahadev", "namah shivay", "jai siya ram",
  "jay shri ram", "ram ram", "radhe krishna", "bolo ram ram"
];

const sanataniReplies = [
  "╔═════════════ஜ۩۞۩ஜ═════════════╗\n🕉️ *Har Har Mahadev!* 🔱\n╚═════════════ஜ۩۞۩ஜ═════════════╝",
  "┏━━━━━━━━━━━━━┓\n🌺 *Radhe Radhe!* 🙏\n┗━━━━━━━━━━━━━┛",
  "╭═══🚩════ஜ۩۞۩ஜ════🚩═══╮\n*🚩 Jai Shree Ram!* 🔥\n╰═══🚩════ஜ۩۞۩ஜ════🚩═══╯",
  "✦••┈┈┈┈ *Jai Siya Ram!* 🌼 ┈┈┈┈••✦",
  "╒═════⟪ॐ⟫═════╕\n*🕉️ Namah Shivay!* 🌙\n╘═════⟪ॐ⟫═════╛",
  "🌸〘 *Bhagwan ka naam lo, sab theek ho jaayega.* 🌞 〙",
  "🌿╭────────────╮🌿\n*🚩 Ram Ram Bhai Sabko!* 🛕\n🌿╰────────────╯🌿",
  "❁❁❁ *Radha Krishna ki kripa bani rahe!* 💫 ❁❁❁",
  "🚩〘 Shiv Shambhu Sabka Kalyan Karen! 🔥 〙🕉️"
];

const sanataniMediaLinks = [
  "https://i.imgur.com/0H0hKQB.jpg",  // Ram ji
  "https://i.imgur.com/zEy3qgR.jpg",  // Radha Krishna
  "https://i.imgur.com/hXM2uG3.jpg",  // Mahadev
  "https://i.imgur.com/nmKM0xU.mp4",  // Mahadev video
  "https://i.imgur.com/XcoA3B7.jpg",  // Ram Darbar
  "https://i.imgur.com/ufWWQZz.jpg",  // Radhe Krishna love
  "https://i.imgur.com/FiX2MBy.mp4",  // Shiv Tandav
  "https://i.imgur.com/Ob1t8Vo.jpg",  // Mahadev Meditating
  "https://i.imgur.com/8jX9uQe.jpg"   // Ram Naam written art
];

module.exports = {
  config: {
    name: "sanatani",
    version: "3.0",
    description: "Pro Max: Bina prefix Sanatani replies with style",
    commandCategory: "spiritual",
    hasPrefix: false,
    usages: "[auto-trigger]",
    cooldowns: 1
  },

  handleEvent: async ({ api, event }) => {
    try {
      const msg = event.body?.toLowerCase();
      if (!msg) return;

      const matched = triggerWords.find(word => msg.includes(word));
      if (!matched) return;

      const replyText = sanataniReplies[Math.floor(Math.random() * sanataniReplies.length)];
      const mediaUrl = sanataniMediaLinks[Math.floor(Math.random() * sanataniMediaLinks.length)];
      const ext = mediaUrl.endsWith(".mp4") ? ".mp4" : ".jpg";
      const fileName = path.join(__dirname, `cache/sanatani${ext}`);

      if (!fs.existsSync(path.dirname(fileName)))
        fs.mkdirSync(path.dirname(fileName), { recursive: true });

      const res = await axios.get(mediaUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(fileName);
      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: replyText,
          attachment: fs.createReadStream(fileName)
        }, event.threadID, () => fs.unlinkSync(fileName), event.messageID);
      });

      writer.on("error", (err) => {
        console.error("Write error:", err);
        api.sendMessage(replyText + `\n🔗 ${mediaUrl}`, event.threadID, event.messageID);
      });
    } catch (err) {
      console.error("❌ Sanatani module error:", err);
    }
  },

  run: async () => {
    // No manual run needed
  }
};
