module.exports.config = {
  name: "info",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Rudra",
  description: "Display swaggy owner and bot info with random stylish image",
  commandCategory: "info",
  cooldowns: 1,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async function ({ api, event }) {
  const axios = global.nodemodule["axios"];
  const request = global.nodemodule["request"];
  const fs = global.nodemodule["fs-extra"];
  const moment = require("moment-timezone");

  const time = process.uptime();
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const dateNow = moment.tz("Asia/Kolkata").format("『DD/MM/YYYY』 ⌚ 【HH:mm:ss】");

  const imgLinks = [
    "https://i.imgur.com/7vCTqbA.jpeg",
    "https://i.imgur.com/VoPlE0Q.jpeg",
    "https://i.imgur.com/5yHDG3r.jpeg",
    "https://i.imgur.com/6rlJUGk.jpeg"
  ];

  const chosenImage = imgLinks[Math.floor(Math.random() * imgLinks.length)];

  const msg = 
`╔═══✦༻🔥༺✦═══╗
        𝐒𝐖𝐀𝐆 𝐌𝐎𝐃𝐄 𝐎𝐍 😎
╚═══✦༻🔥༺✦═══╝

🧠 𝗢𝗪𝗡𝗘𝗥: 𓆩 𝑹𝑼𝑫𝑹𝑨 ⚡𓆪
👑 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: ${global.config.BOTNAME || "🔥 𝐑𝐔𝐃𝐑𝐀 ⚔️"}
🔗 𝗜𝗡𝗦𝗧𝗔: @haryana_aala_sayzs
🆔 𝗨𝗜𝗗: 61550558518720

🌐 𝗣𝗥𝗘𝗙𝗜𝗫: 『 ${global.config.PREFIX || "+"} 』
📅 𝗗𝗔𝗧𝗘: ${dateNow}
⏳ 𝗨𝗣𝗧𝗜𝗠𝗘: ${hours}h ${minutes}m ${seconds}s

📜 𝗧𝗬𝗣𝗘: '${global.config.PREFIX || "+"}help' 𝗧𝗢 𝗦𝗘𝗘 𝗔𝗟𝗟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 💌

╭──────────────╮
💖 𝑴𝒂𝒅𝒆 𝒘𝒊𝒕𝒉 𝑺𝒘𝒂𝒈 𝒃𝒚 𝑹𝑼𝑫𝑹𝑨 💥
╰──────────────╯`;

  const callback = () =>
    api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(__dirname + "/cache/rudra_info.jpg")
      },
      event.threadID,
      () => fs.unlinkSync(__dirname + "/cache/rudra_info.jpg")
    );

  request(encodeURI(chosenImage))
    .pipe(fs.createWriteStream(__dirname + "/cache/rudra_info.jpg"))
    .on("close", () => callback());
};
