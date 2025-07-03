const fs = require("fs-extra");
const path = require("path");

const lockNickDataPath = path.join(__dirname, "locknick.json");

// lockNickData कोynchronously लोड करें, ताकि यह सुनिश्चित हो कि फाइल तैयार है
let lockNickData = {};
try {
  if (fs.existsSync(lockNickDataPath)) {
    lockNickData = JSON.parse(fs.readFileSync(lockNickDataPath, "utf8"));
  }
} catch (error) {
  console.error("locknick.json को लोड करते समय त्रुटि:", error);
  // यदि JSON दूषित है, तो इसे खाली ऑब्जेक्ट के रूप में शुरू करें
  lockNickData = {};
}

function saveLockData() {
  try {
    fs.writeFileSync(lockNickDataPath, JSON.stringify(lockNickData, null, 2), "utf8");
  } catch (error) {
    console.error("locknick.json को सेव करते समय त्रुटि:", error);
  }
}

module.exports = {
  config: {
    name: "locknick",
    version: "1.0.1", // version update kiya
    author: "Raj",
    countDown: 5,
    role: 1, // 1 = Admin, 0 = User (आपके बॉट फ्रेमवर्क के हिसाब से एडजस्ट करें)
    shortDescription: "ग्रुप में सभी सदस्यों के निकनेम लॉक करें",
    longDescription: "सदस्यों को उनके निकनेम बदलने से रोकता है।",
    category: "group",
    guide: "{p}locknick on/off"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // बॉट के पास Admin/Mod permissions हैं या नहीं, यह जांचें (अगर आपका API इसकी अनुमति देता है)
    // यह फ्रेमवर्क-विशिष्ट हो सकता है। उदाहरण के लिए:
    // const threadInfo = await api.getThreadInfo(threadID);
    // if (!threadInfo.adminIDs.some(admin => admin.id === api.getCurrentUserID())) {
    //   return message.reply("माफ़ कीजिये, मेरे पास निकनेम लॉक करने की पर्याप्त अनुमतियाँ नहीं हैं। मुझे ग्रुप एडमिन बनाएं।");
    // }

    if (!args[0]) {
      return message.reply("⚠️ कृपया उपयोग करें: `locknick on` या `locknick off`");
    }

    const command = args[0].toLowerCase();

    if (command === "on") {
      if (lockNickData[threadID]) {
        return message.reply("🔒 यह ग्रुप पहले से ही निकनेम लॉक मोड में है।");
      }

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo) {
            return message.reply("ग्रुप की जानकारी प्राप्त नहीं कर सका।");
        }
        
        const nicknames = {};
        for (const user of threadInfo.userInfo) {
          // बॉट का खुद का निकनेम लॉक न करें
          if (user.id !== api.getCurrentUserID()) {
            nicknames[user.id] = user.nickname || "";
          }
        }

        lockNickData[threadID] = nicknames;
        saveLockData();

        return message.reply("🔒 सभी सदस्यों के निकनेम सफलतापूर्वक लॉक कर दिए गए। अब वे अपने निकनेम नहीं बदल पाएंगे।");

      } catch (error) {
        console.error("locknick on करते समय त्रुटि:", error);
        return message.reply("निकनेम लॉक करते समय कोई त्रुटि हुई। कृपया दोबारा प्रयास करें या लॉग जांचें।");
      }
    } else if (command === "off") {
      if (!lockNickData[threadID]) {
        return message.reply("⚠️ यह ग्रुप पहले से ही निकनेम अनलॉक मोड में है!");
      }

      try {
        delete lockNickData[threadID];
        saveLockData();
        return message.reply("✅ निकनेम लॉक सफलतापूर्वक हटा दिया गया। अब सदस्य अपना निकनेम बदल सकते हैं।");
      } catch (error) {
        console.error("locknick off करते समय त्रुटि:", error);
        return message.reply("निकनेम लॉक हटाते समय कोई त्रुटि हुई। कृपया दोबारा प्रयास करें या लॉग जांचें।");
      }
    } else {
      return message.reply("❌ अमान्य विकल्प! कृपया उपयोग करें: `locknick on` या `locknick off`");
    }
  },

  onEvent: async function ({ event, api }) {
    const { threadID, logMessageType, logMessageData, senderID } = event;

    // यदि इस ग्रुप के लिए निकनेम लॉक नहीं है तो वापस आ जाएं
    if (!lockNickData[threadID]) return;

    // यदि यह एक निकनेम बदलने वाला लॉग संदेश है
    if (logMessageType === "log:thread-nickname") {
      const changedUserID = logMessageData.participant_id;
      const newNickname = logMessageData.nickname;

      // यदि बॉट खुद निकनेम बदल रहा है (जो हमारे कोड में ही हो रहा है), तो उसे नजरअंदाज करें
      if (changedUserID === api.getCurrentUserID()) {
        return;
      }

      const lockedNick = lockNickData[threadID][changedUserID];

      // यदि बदला गया निकनेम लॉक किए गए निकनेम से भिन्न है
      if (typeof lockedNick !== 'undefined' && newNickname !== lockedNick) {
        try {
          await api.changeNickname(lockedNick, threadID, changedUserID);
          api.sendMessage(
            `🔄 "${newNickname || "blank"}" निकनेम का पता चला।\nपुराना निकनेम वापस सेट कर दिया गया: "${lockedNick || "blank"}".`,
            threadID
          );
        } catch (error) {
          console.error(`निकनेम वापस सेट करते समय त्रुटि thread ${threadID} में user ${changedUserID} के लिए:`, error);
          // वैकल्पिक रूप से, आप यहां एक प्रशासक को संदेश भेज सकते हैं कि त्रुटि हुई
          api.sendMessage(
            `❌ निकनेम वापस सेट करने में त्रुटि हुई। (यूजर ID: ${changedUserID})`,
            threadID
          );
        }
      }
    }
  }
};
