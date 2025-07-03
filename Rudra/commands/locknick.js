const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61550558518720"; // Your UID

const NICKNAME_LOCK_FILE = path.join(__dirname, "../data/locked_nicknames.json");

// Function to load data
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

// Function to save data
function saveLockedNicknames(data) {
    try {
        fs.ensureFileSync(NICKNAME_LOCK_FILE);
        fs.writeFileSync(NICKNAME_LOCK_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving locked nicknames:", error);
    }
}

// --- MAIN CHANGE HERE: Exporting config and run directly ---
module.exports.config = { // Changed from module.exports = { config: { ... }
    name: "locknick",
    version: "2.3.0", // Version update for this fix
    author: "Your Name",
    hasPermssion: 0, // <--- ADDED THIS PROPERTY (from lockname.js)
    credits: "Rudra x ChatGPT", // <--- ADDED THIS PROPERTY (from lockname.js)
    description: "Group mein nicknames lock/unlock kare", // Using description from your lockname
    commandCategory: "group",
    usages: "locknick [on/off]",
    cooldowns: 5 // Changed from countDown to cooldowns (from lockname.js)
};

module.exports.run = async function ({ api, event, args }) { // Changed from module.exports.run = async function ({ message, event, args, api })
    const { threadID, senderID } = event; // Destructuring event properties like in lockname.js
    const subcmd = args[0] ? args[0].toLowerCase() : ""; // Using subcmd like in lockname.js

    // Load data inside the run function, as before, to avoid circular dependency
    let lockedNicknames = loadLockedNicknames();

    // Owner UID check
    if (senderID !== OWNER_UID) {
        return api.sendMessage("⛔ Sirf malik use kar sakta hai!", threadID);
    }

    // Logic for 'on' and 'off' commands
    switch (subcmd) { // Using switch like in lockname.js
        case "on": {
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
                saveLockedNicknames(lockedNicknames);

                return api.sendMessage("🔒 इस ग्रुप के सभी सदस्यों के निकनेम सफलतापूर्वक लॉक कर दिए गए हैं।", threadID);

            } catch (error) {
                console.error("locknick 'on' कमांड में त्रुटि:", error);
                return api.sendMessage("निकनेम लॉक करते समय कोई त्रुटि हुई। कृपया लॉग जांचें।", threadID);
            }
        }

        case "off": {
            if (!lockedNicknames[threadID]) {
                return api.sendMessage("⚠️ यह ग्रुप पहले से ही निकनेम अनलॉक मोड में है!", threadID);
            }

            try {
                delete lockedNicknames[threadID];
                saveLockedNicknames(lockedNicknames);

                return api.sendMessage("✅ निकनेम लॉक सफलतापूर्वक हटा दिया गया। अब सदस्य अपना निकनेम बदल सकते हैं।", threadID);
            } catch (error) {
                console.error("locknick 'off' कमांड में त्रुटि:", error);
                return api.sendMessage("निकनेम लॉक हटाते समय कोई त्रुटि हुई। कृपया लॉग जांचें।", threadID);
            }
        }

        default:
            return api.sendMessage("❌ अमान्य विकल्प! कृपया उपयोग करें: `{p}locknick on` या `{p}locknick off`", threadID);
    }
};

// **No need to export lockedNicknamesData from here anymore.**
// The event file will load it directly.
// This matches your lockname.js structure where lockedNames is exported separately, but for locknick
// we'll rely on the event file reading the JSON directly.
// module.exports.lockedNicknamesData = lockedNicknames; // <-- REMOVE THIS LINE
