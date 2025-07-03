const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61550558518720";
const lockNickDataPath = path.join(__dirname, "locknick.json");
let lockNickData = fs.existsSync(lockNickDataPath) ? JSON.parse(fs.readFileSync(lockNickDataPath)) : {};

function saveLockData() {
  fs.writeFileSync(lockNickDataPath, JSON.stringify(lockNickData, null, 2));
}

module.exports = {
  config: {
    name: "locknick",
    version: "1.0.1",
    author: "Rudra x ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Lock all nicknames in group",
    longDescription: "Prevents members from changing nicknames",
    category: "group",
    guide: "{p}locknick on/off"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    if (senderID !== OWNER_UID) return message.reply("❌ Sirf bot ke owner ko yeh command chalane ki ijazat hai.");

    if (!args[0]) return message.reply("⚠️ इस्तेमाल करें: locknick on/off");

    if (args[0].toLowerCase() === "on") {
      const threadInfo = await api.getThreadInfo(threadID);
      const nicknames = {};

      for (const user of threadInfo.userInfo) {
        nicknames[user.id] = user.nickname || "";
      }

      lockNickData[threadID] = nicknames;
      saveLockData();

      return message.reply("🔒 सभी members के nicknames लॉक कर दिए गए।");
    }

    if (args[0].toLowerCase() === "off") {
      if (!lockNickData[threadID]) return message.reply("⚠️ Nickname पहले से unlocked हैं!");

      delete lockNickData[threadID];
      saveLockData();
      return message.reply("✅ Nickname lock हटा दिया गया।");
    }

    return message.reply("❌ Invalid option! Use: locknick on/off");
  },

  onEvent: async function ({ event, api }) {
    const { threadID, logMessageType, logMessageData } = event;

    if (!lockNickData[threadID]) return;

    if (logMessageType === "log:thread-nickname") {
      const userID = logMessageData.participant_id;
      const lockedNick = lockNickData[threadID][userID] || "";

      if (logMessageData.nickname !== lockedNick) {
        await api.changeNickname(lockedNick, threadID, userID);
        api.sendMessage(
          `🔄 "${logMessageData.nickname || "blank"}" nickname detect हुआ था।\nपुराना nickname वापस set कर दिया गया।`,
          threadID
        );
      }
    }
  }
};
