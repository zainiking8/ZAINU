const { lockedNicknamesData } = require('../commands/locknick.js');

module.exports.config = {
  name: "nicknameLockEvent",
  eventType: ["log:thread-nickname"],
  version: "1.0",
  credits: "Rudra x ChatGPT"
};

module.exports.run = async function({ event, api }) {
  const { threadID, logMessageData } = event;

  if (!lockedNicknamesData[threadID]) return;

  const changedUserID = logMessageData.participant_id;
  const newNickname = logMessageData.nickname;

  if (changedUserID === api.getCurrentUserID()) {
    return;
  }

  const originalLockedNick = lockedNicknamesData[threadID][changedUserID];

  if (typeof originalLockedNick !== 'undefined' && newNickname !== originalLockedNick) {
    try {
      await api.changeNickname(originalLockedNick, threadID, changedUserID);

      api.sendMessage(
        `🔄 "${newNickname || "blank"}" निकनेम डिटेक्ट हुआ।\nपुराना निकनेम वापस सेट कर दिया गया: "${originalLockedNick || "blank"}".`,
        threadID
      );
    } catch (err) {
      console.error(`Error resetting nickname for user ${changedUserID} in thread ${threadID}:`, err);
    }
  }
};
