const fs = require("fs");
const path = require("path");

const LOCKS_PATH = path.join(__dirname, "../../../includes/database/nameLocks.json");

module.exports = async function ({ api, event }) {
  if (event.logMessageType === "log:thread-name" || event.logMessageType === "log:user-nickname") {
    const threadID = event.threadID;
    const changedID = event.logMessageData?.participant_id;
    const newNickname = event.logMessageData?.nickname;

    if (!changedID || !newNickname) return;

    if (!fs.existsSync(LOCKS_PATH)) return;
    const locks = JSON.parse(fs.readFileSync(LOCKS_PATH, "utf-8"));

    if (locks[threadID] && locks[threadID][changedID]) {
      const lockedName = locks[threadID][changedID];
      if (newNickname !== lockedName) {
        api.changeNickname(lockedName, threadID, changedID);
        api.sendMessage(`⚠️ Locked nickname hai. Wapas "${lockedName}" set kar diya gaya.`, threadID);
      }
    }
  }
};
