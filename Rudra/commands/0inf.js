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
    "https://i.imgur.com/WhVSHLB.png",
    "https://i.imgur.com/QcNXYfT.jpg",
    "https://i.imgur.com/rg0fjQE.jpg",
    "https://i.postimg.cc/4yVw6tm7/Picsart-23-03-26-11-08-19-025.jpg"
  ];

  const chosenImage = imgLinks[Math.floor(Math.random() * imgLinks.length)];

  const msg = 
`╔═══✦༻🔥༺✦═══╗
         𝗢𝗪𝗡𝗘𝗥 🔥☞︎︎︎ 𝙰𝚛𝚞𝚗 𝙺𝚞𝚖𝚊𝚛 ☜︎︎︎✰ \n\n
🙈🄾🅆🄽🄴🅁 🄲🄾🄽🅃🄰🄲🅃 🄻🄸🄽🄺🅂🙈➪ \n\n  𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 🧨https://www.facebook.com/arun.x76 💞🕊️
  \n 
✅𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗨𝗦𝗘𝗥𝗡𝗔𝗠𝗘👉 @arunkumar_031 \n\n  ====𝗧𝗼 𝗹𝗲𝗮𝗿𝗻 𝗛𝗼𝘄 𝘁𝗼 𝗖𝗿𝗲𝗮𝘁𝗲 𝗔 𝗯𝗼𝘁 === 𝗩𝗶𝘀𝗶𝘁 𝗔𝗻𝗱 𝗦𝘂𝗯𝘀𝗰𝗿𝗶𝗯𝗲 𝗧𝗼 𝗠𝘆 𝗖𝗵𝗮𝗻𝗻𝗲𝗹✅ 🗡 https://www.youtube.com/@mirrykal
✧══════•❁❀❁•══════✧
Youtube channel : https://m.youtube.com/@mirrykal
╚═══✦༻🔥༺✦═══╝


👑 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: ${global.config.BOTNAME || "🔥𝙰𝚛𝚞𝚗 𝙺𝚞𝚖𝚊𝚛 "}
🔗 𝗜𝗡𝗦𝗧𝗔: @mirrykal 
🆔 𝗨𝗜𝗗: 61550558518720

🌐 𝗣𝗥𝗘𝗙𝗜𝗫: 『 ${global.config.PREFIX || "+"} 』
📅 𝗗𝗔𝗧𝗘: ${dateNow}
⏳ 𝗨𝗣𝗧𝗜𝗠𝗘: ${hours}h ${minutes}m ${seconds}s

📜 𝗧𝗬𝗣𝗘: '${global.config.PREFIX || "+"}help' 𝗧𝗢 𝗦𝗘𝗘 𝗔𝗟𝗟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 💌

╯`;

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
