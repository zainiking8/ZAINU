// ✅ commands/autosetname.js

const fs = require("fs");
const path = __dirname + "/../../includes/autosetname.json";
const OWNER_UID = "61550558518720";

if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

module.exports.config = {
  name: "autosetname",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rudra x ChatGPT",
  description: "Lock/unlock user nickname in group",
  commandCategory: "group",
  usages: "autosetname lock/reset/unlock @tag Name",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID, mentions } = event;
  if (senderID !== OWNER_UID)
    return api.sendMessage("❌ Ye command sirf malik (UID: 61550558518720) ke liye hai.", threadID);

  const data = JSON.parse(fs.readFileSync(path));
  const subcmd = args[0]?.toLowerCase();
  const mentionIDs = Object.keys(mentions);

  if (!["lock", "unlock", "reset"].includes(subcmd) || mentionIDs.length === 0)
    return api.sendMessage("📌 Usage:\nautosetname lock @tag Rudra King\nautosetname reset @tag\nautosetname unlock @tag", threadID);

  const uid = mentionIDs[0];

  switch (subcmd) {
    case "lock":
      const nameToLock = args.slice(2).join(" ");
      if (!nameToLock) return api.sendMessage("❗ Naam bhi do lock karne ke liye.", threadID);
      if (!data[threadID]) data[threadID] = {};
      data[threadID][uid] = nameToLock;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      await api.changeNickname(nameToLock, threadID, uid);
      return api.sendMessage(`🔒 Naam lock ho gaya: ${nameToLock}`, threadID);

    case "unlock":
      if (data[threadID]?.[uid]) {
        delete data[threadID][uid];
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        return api.sendMessage("🔓 Naam unlock kar diya gaya.", threadID);
      } else {
        return api.sendMessage("⚠️ Koi naam lock nahi mila is user ke liye.", threadID);
      }

    case "reset":
      if (data[threadID]?.[uid]) {
        await api.changeNickname(data[threadID][uid], threadID, uid);
        return api.sendMessage(`✅ Naam wapas set kar diya gaya: ${data[threadID][uid]}`, threadID);
      } else {
        return api.sendMessage("⚠️ Koi locked naam set nahi hai.", threadID);
      }
  }
};
