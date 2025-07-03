const fs = require("fs");
const path = __dirname + "/../../includes/autosetname.json";
if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

const OWNER_UID = "61550558518720"; // 🔐 Only you

module.exports.config = {
  name: "autosetname",
  version: "1.0.0",
  credits: "Rudra x ChatGPT",
  description: "Lock/unlock/reset nickname for user"
};

module.exports.run = async ({ api, event, args, mentions }) => {
  const { threadID, senderID } = event;
  const data = JSON.parse(fs.readFileSync(path));
  const type = args[0];
  const mention = Object.keys(mentions)[0];
  const nickname = args.slice(2).join(" ");

  // ✅ Only owner can use
  if (senderID !== OWNER_UID)
    return api.sendMessage("❌ Sirf bot owner is command ko use kar sakta hai.", threadID);

  if (!["lock", "unlock", "reset"].includes(type))
    return api.sendMessage(
      "📌 Usage:\nautosetname lock @tag Rudra\nautosetname reset @tag\nautosetname unlock @tag",
      threadID
    );

  if (!data[threadID]) data[threadID] = {};

  if (type === "lock") {
    if (!mention || !nickname)
      return api.sendMessage("❌ Tag aur naam dono zaruri hain.", threadID);
    data[threadID][mention] = nickname;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    await api.changeNickname(nickname, threadID, mention);
    return api.sendMessage(`🔒 Naam lock ho gaya: ${nickname}`, threadID);
  }

  if (type === "unlock") {
    if (!mention) return api.sendMessage("❌ Tag required.", threadID);
    delete data[threadID][mention];
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage(`🔓 Naam unlock ho gaya.`, threadID);
  }

  if (type === "reset") {
    if (!mention) return api.sendMessage("❌ Tag required.", threadID);
    const lockedName = data[threadID][mention];
    if (!lockedName) return api.sendMessage("⚠️ Naam locked nahi hai.", threadID);
    await api.changeNickname(lockedName, threadID, mention);
    return api.sendMessage(`♻️ Naam reset kar diya gaya: ${lockedName}`, threadID);
  }
};
