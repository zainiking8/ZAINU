// ✅ events/autosetname.js

const fs = require("fs");
const path = __dirname + "/../../includes/autosetname.json";
if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

module.exports.config = {
  name: "autosetname",
  version: "1.0.0",
  credits: "Rudra x ChatGPT",
  description: "Reset user nickname if changed"
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, logMessageType, logMessageData } = event;
  if (logMessageType !== "log:thread-nickname") return;

  const data = JSON.parse(fs.readFileSync(path));
  if (!data[threadID]) return;

  const uid = logMessageData.participant_id;
  const currentName = logMessageData.nickname;
  const lockedName = data[threadID][uid];

  if (lockedName && currentName !== lockedName) {
    try {
      await api.changeNickname(lockedName, threadID, uid);
      api.sendMessage(`⚠️ Naam locked hai. Reset kar diya gaya: ${lockedName}`, threadID);
    } catch (e) {
      console.log("❌ Error resetting name:", e);
    }
  }
};
