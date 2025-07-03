const fs = require("fs-extra"); // <--- fs-extra इम्पोर्ट करें
const path = require("path"); // <--- path इम्पोर्ट करें

const NICKNAME_LOCK_FILE = path.join(__dirname, "../data/locked_nicknames.json"); // <--- पाथ को एडजस्ट करें

// डेटा लोड करने के लिए फंक्शन (डुप्लिकेट लेकिन सर्कुलर डिपेंडेंसी से बचने के लिए आवश्यक)
function loadLockedNicknames() {
    try {
        if (fs.existsSync(NICKNAME_LOCK_FILE)) {
            return JSON.parse(fs.readFileSync(NICKNAME_LOCK_FILE, "utf8"));
        }
    } catch (error) {
        console.error("Error loading locked nicknames in event:", error);
    }
    return {};
}

module.exports.config = {
  name: "nicknameLockEvent",
  eventType: ["log:thread-nickname"],
  version: "1.0",
  credits: "Rudra x ChatGPT"
};

module.exports.run = async function({ event, api }) {
  const { threadID, logMessageData } = event;

  // **मुख्य बदलाव: यहाँ डेटा को सीधे JSON फ़ाइल से लोड करें**
  const lockedNicknamesData = loadLockedNicknames();

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
