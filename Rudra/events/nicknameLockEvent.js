const fs = require("fs-extra");
const path = require("path");

const NICKNAME_LOCK_FILE = path.join(__dirname, "../data/locked_nicknames.json");

// डेटा लोड करने के लिए फंक्शन
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
  eventType: ["log:thread-nickname"], // यह स्पेसिफिक इवेंट टाइप को सुनता है
  version: "1.1", // Version updated
  credits: "Rudra x ChatGPT"
};

module.exports.run = async function({ event, api }) {
  const { threadID, logMessageData } = event;

  // डेटा को सीधे JSON फ़ाइल से लोड करें
  const lockedNicknamesData = loadLockedNicknames();

  // यदि इस थ्रेड के लिए निकनेम लॉक नहीं है तो वापस आ जाएं
  if (!lockedNicknamesData[threadID]) return;

  const changedUserID = logMessageData.participant_id;
  const newNickname = logMessageData.nickname;

  // यदि बॉट खुद निकनेम बदल रहा है तो उसे अनदेखा करें ताकि लूप न हो
  if (changedUserID === api.getCurrentUserID()) {
    return;
  }

  const originalLockedNick = lockedNicknamesData[threadID][changedUserID];

  // यदि बदला गया निकनेम लॉक किए गए निकनेम से भिन्न है
  if (typeof originalLockedNick !== 'undefined' && newNickname !== originalLockedNick) {
    try {
      await api.changeNickname(originalLockedNick, threadID, changedUserID);

      // चेतावनी संदेश भेजें कि नाम वापस सेट कर दिया गया है
      api.sendMessage(
        `⚠️ @${changedUserID}, आपका निकनेम लॉक है। इसे "${originalLockedNick || "blank"}" पर वापस सेट कर दिया गया है। कृपया इसे बदलने की कोशिश न करें।`,
        threadID,
        (err) => { // Message callback to mention user
          if (err) console.error("Error sending mention message:", err);
        },
        [changedUserID] // User ID to mention
      );
    } catch (err) {
      console.error(`Error resetting nickname for user ${changedUserID} in thread ${threadID}:`, err);
      // यदि निकनेम रीसेट करने में कोई गंभीर त्रुटि हो तो मालिक को सूचित करें
      // api.sendMessage(`❌ निकनेm रीसेट करने में त्रुटि हुई for user ID: ${changedUserID}.`, threadID);
    }
  }
};
