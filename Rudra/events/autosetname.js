module.exports.config = {
  name: "autosetname",
  version: "1.0.0",
  credits: "Rudra x ChatGPT",
  description: "Auto reset nickname if changed",
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, logMessageType, logMessageData } = event;

  if (logMessageType !== "log:thread-nickname") return;
  if (!global.userNameLocks) return;

  const userID = logMessageData.participant_id;
  const newName = logMessageData.nickname;
  const lockedName = global.userNameLocks[userID];

  if (lockedName && newName !== lockedName) {
    try {
      await api.changeNickname(lockedName, threadID, userID);
      api.sendMessage(`⚠️ Naam locked hai. Reset kar diya gaya: ${lockedName}`, threadID);
    } catch (err) {
      console.error("❌ Error resetting nickname:", err);
    }
  }
};
