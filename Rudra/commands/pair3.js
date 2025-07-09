module.exports.config = {
  name: "pair3",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Modified by Arun (original: Priyansh Rajput)",
  description: "Pair two people and show their names below profile pictures",
  commandCategory: "Fun",
  usages: "",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 0
};

module.exports.run = async function ({ args, Users, Threads, api, event, Currencies }) {
  const { loadImage, createCanvas, registerFont } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];

  let pathImg = __dirname + "/cache/background.png";
  let pathAvt1 = __dirname + "/cache/Avtmot.png";
  let pathAvt2 = __dirname + "/cache/Avthai.png";

  var id1 = event.senderID;
  var name1 = await Users.getNameUser(id1);
  var ThreadInfo = await api.getThreadInfo(event.threadID);
  var all = ThreadInfo.userInfo;

  for (let c of all) {
    if (c.id == id1) var gender1 = c.gender;
  }

  const botID = api.getCurrentUserID();
  let ungvien = [];

  if (gender1 == "FEMALE") {
    for (let u of all) {
      if (u.gender == "MALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
    }
  } else if (gender1 == "MALE") {
    for (let u of all) {
      if (u.gender == "FEMALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
    }
  } else {
    for (let u of all) {
      if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
    }
  }

  var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
  var name2 = await Users.getNameUser(id2);

  var tileOptions = ["0", "-1", "99.99", "-99", "-100", "101", "0.01"];
  var randomPercent = Math.random() < 0.8
    ? Math.floor(Math.random() * 100) + 1
    : tileOptions[Math.floor(Math.random() * tileOptions.length)];

  var backgrounds = [
    "https://i.postimg.cc/wjJ29HRB/background1.png",
    "https://i.postimg.cc/zf4Pnshv/background2.png",
    "https://i.postimg.cc/5tXRQ46D/background3.png"
  ];
  var selectedBG = backgrounds[Math.floor(Math.random() * backgrounds.length)];

  // Get avatars and background
  let getAvtmot = (await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

  let getAvthai = (await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

  let getBackground = (await axios.get(`${selectedBG}`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathImg, Buffer.from(getBackground, "utf-8"));

  let baseImage = await loadImage(pathImg);
  let baseAvt1 = await loadImage(pathAvt1);
  let baseAvt2 = await loadImage(pathAvt2);
  let canvas = createCanvas(baseImage.width, baseImage.height);
  let ctx = canvas.getContext("2d");

  // Draw background and avatars
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseAvt1, 100, 150, 300, 300);
  ctx.drawImage(baseAvt2, 900, 150, 300, 300);

  // Draw names in black below avatars
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText(name1, 250, 500);  // name1 under first DP
  ctx.fillText(name2, 1050, 500); // name2 under second DP

  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  fs.removeSync(pathAvt1);
  fs.removeSync(pathAvt2);

  return api.sendMessage({
    body: `Congratulations ${name1} successfully paired with ${name2}\nThe odds are ${randomPercent}%`,
    mentions: [{
      tag: name2,
      id: id2
    }],
    attachment: fs.createReadStream(pathImg)
  }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
};
