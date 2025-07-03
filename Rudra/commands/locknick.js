const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61550558518720"; // आपकी UID

const NICKNAME_LOCK_FILE = path.join(__dirname, "../data/locked_nicknames.json");

// डेटा लोड करने के लिए फंक्शन
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

// डेटा सेव करने के लिए फंक्शन
function saveLockedNicknames(data) {
    try {
        fs.ensureFileSync(NICKNAME_LOCK_FILE);
        fs.writeFileSync(NICKNAME_LOCK_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving locked nicknames:", error);
    }
}

// **मुख्य बदलाव: lockedNicknames को अब यहाँ सीधे एक्सपोर्ट नहीं किया जाएगा**
// बल्कि, run फंक्शन के अंदर इसे लोड/सेव किया जाएगा।

module.exports = {
  config: {
    name: "locknick",
    version: "2.2.0", // Version update
    author: "Your Name",
    countDown: 5,
    role: 1, // टेस्टिंग के लिए 0 रख सकते हैं
    shortDescription: "ग्रुप में निकनेम लॉक/अनलॉक करें",
    longDescription: "ग्रुप के सदस्यों को उनके निकनेम बदलने से रोकता है।",
    category: "group",
    guide: "{p}locknick [on/off]"
  },

  run: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const command = args[0] ? args[0].toLowerCase() : "";

    // **यहाँ, हम कमांड शुरू होने पर डेटा लोड करेंगे**
    let lockedNicknames = loadLockedNicknames(); // <--- डेटा को यहाँ लोड करें

    if (senderID !== OWNER_UID) {
      return api.sendMessage("⛔ Sirf malik use kar sakta hai!", threadID);
    }

    if (command === "") {
      return api.sendMessage("⚠️ कृपया उपयोग करें: `{p}locknick on` या `{p}locknick off`", threadID);
    }

    if (command === "on") {
      if (lockedNicknames[threadID]) {
        return api.sendMessage("🔒 यह ग्रुप पहले से ही निकनेम लॉक मोड में है।", threadID);
      }

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo || !threadInfo.userInfo) {
            return api.sendMessage("ग्रुप की जानकारी प्राप्त करने में असमर्थ। सुनिश्चित करें कि बॉट ग्रुप में है और उसके पास अनुमतियाँ हैं।", threadID);
        }

        const currentNicks = {};
        for (const user of threadInfo.userInfo) {
          if (user.id !== api.getCurrentUserID()) {
            currentNicks[user.id] = user.nickname || "";
          }
        }

        lockedNicknames[threadID] = currentNicks;
        saveLockedNicknames(lockedNicknames); // <--- डेटा को यहाँ सेव करें

        return api.sendMessage("🔒 इस ग्रुप के सभी सदस्यों के निकनेम सफलतापूर्वक लॉक कर दिए गए हैं।", threadID);

      } catch (error) {
        console.error("locknick 'on' कमांड में त्रुटि:", error);
        return api.sendMessage("निकनेम लॉक करते समय कोई त्रुटि हुई। कृपया लॉग जांचें।", threadID);
      }
    }
    else if (command === "off") {
      if (!lockedNicknames[threadID]) {
        return api.sendMessage("⚠️ यह ग्रुप पहले से ही निकनेम अनलॉक मोड में है!", threadID);
      }

      try {
        delete lockedNicknames[threadID];
        saveLockedNicknames(lockedNicknames); // <--- डेटा को यहाँ सेव करें

        return api.sendMessage("✅ निकनेम लॉक सफलतापूर्वक हटा दिया गया। अब सदस्य अपना निकनेम बदल सकते हैं।", threadID);
      } catch (error) {
        console.error("locknick 'off' कमांड में त्रुटि:", error);
        return api.sendMessage("निकनेम लॉक हटाते समय कोई त्रुटि हुई। कृपया लॉग जांचें।", threadID);
      }
    }
    else {
      return api.sendMessage("❌ अमान्य विकल्प! कृपया उपयोग करें: `{p}locknick on` या `{p}locknick off`", threadID);
    }
  },

  // **मुख्य बदलाव: lockedNicknamesData को हटा दिया गया है**
  // अब इवेंट फ़ाइल सीधे JSON फ़ाइल से डेटा लोड करेगी।
};
