const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61550558518720"; // <--- ये लाइन जोड़ दी है (आपकी lockname कमांड से ली गई UID)

const NICKNAME_LOCK_FILE = path.join(__dirname, "../data/locked_nicknames.json"); // data फोल्डर में सेव करेंगे

// डेटा लोड और सेव करने के लिए फंक्शन
function loadLockedNicknames() {
    try {
        if (fs.existsSync(NICKNAME_LOCK_FILE)) {
            return JSON.parse(fs.readFileSync(NICKNAME_LOCK_FILE, "utf8"));
        }
    } catch (error) {
        console.error("Error loading locked nicknames:", error);
    }
    return {};
}

function saveLockedNicknames(data) {
    try {
        fs.ensureFileSync(NICKNAME_LOCK_FILE); // सुनिश्चित करें कि फाइल मौजूद है
        fs.writeFileSync(NICKNAME_LOCK_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving locked nicknames:", error);
    }
}

let lockedNicknames = loadLockedNicknames(); // बॉट स्टार्ट होने पर डेटा लोड करें

module.exports = {
  config: {
    name: "locknick",
    version: "2.1.1", // Updated version
    author: "Your Name",
    countDown: 5,
    role: 1, // 1 = Admin, 0 = User. टेस्टिंग के लिए 0 रख सकते हैं।
    shortDescription: "ग्रुप में निकनेम लॉक/अनलॉक करें",
    longDescription: "ग्रुप के सदस्यों को उनके निकनेम बदलने से रोकता है।",
    category: "group",
    guide: "{p}locknick [on/off]"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID; // <--- senderID को प्राप्त करें
    const command = args[0] ? args[0].toLowerCase() : "";

    // OWNER_UID की जाँच करें
    if (senderID !== OWNER_UID) {
      return message.reply("⛔ Sirf malik use kar sakta hai!");
    }

    if (command === "") {
      return message.reply("⚠️ कृपया उपयोग करें: `{p}locknick on` या `{p}locknick off`");
    }

    if (command === "on") {
      if (lockedNicknames[threadID]) {
        return message.reply("🔒 यह ग्रुप पहले से ही निकनेम लॉक मोड में है।");
      }

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo || !threadInfo.userInfo) {
            return message.reply("ग्रुप की जानकारी प्राप्त करने में असमर्थ। सुनिश्चित करें कि बॉट ग्रुप में है और उसके पास अनुमतियाँ हैं।");
        }

        const currentNicks = {};
        for (const user of threadInfo.userInfo) {
          if (user.id !== api.getCurrentUserID()) { // बॉट का निकनेम लॉक न करें
            currentNicks[user.id] = user.nickname || "";
          }
        }

        lockedNicknames[threadID] = currentNicks;
        saveLockedNicknames(lockedNicknames);

        return message.reply("🔒 इस ग्रुप के सभी सदस्यों के निकनेम सफलतापूर्वक लॉक कर दिए गए हैं।");

      } catch (error) {
        console.error("locknick 'on' कमांड में त्रुटि:", error);
        return message.reply("निकनेम लॉक करते समय कोई त्रुटि हुई। कृपया लॉग जांचें।");
      }
    }
    else if (command === "off") {
      if (!lockedNicknames[threadID]) {
        return message.reply("⚠️ यह ग्रुप पहले से ही निकनेम अनलॉक मोड में है!");
      }

      try {
        delete lockedNicknames[threadID];
        saveLockedNicknames(lockedNicknames);

        return message.reply("✅ निकनेम लॉक सफलतापूर्वक हटा दिया गया। अब सदस्य अपना निकनेm बदल सकते हैं।");
      } catch (error) {
        console.error("locknick 'off' कमांड में त्रुटि:", error);
        return message.reply("निकनेम लॉक हटाते समय कोई त्रुटि हुई। कृपया लॉग जांचें।");
      }
    }
    else {
      return message.reply("❌ अमान्य विकल्प! कृपया उपयोग करें: `{p}locknick on` या `{p}locknick off`");
    }
  },

  lockedNicknamesData: lockedNicknames
};
