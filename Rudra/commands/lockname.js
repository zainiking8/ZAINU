const OWNER_UID = "61550558518720";
let lockedGroupNames = {}; // Memory-based storage for locked names

module.exports.config = {
  name: "lockname",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rudra x ChatGPT",
  description: "Lock group name; bot auto-resets if changed (owner-only)",
  commandCategory: "group",
  usages: "lockname [lock/unlock/reset] [name]",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID } = event;

  // Only owner allowed
  if (senderID !== OWNER_UID) {
    return api.sendMessage("⛔ Yeh command sirf owner (UID: 61550558518720) ke liye hai.", threadID);
  }

  const subcmd = args[0]?.toLowerCase();

  if (!subcmd) {
    return api.sendMessage(
      "📌 Usage:\n• lockname lock <group name>\n• lockname unlock\n• lockname reset",
      threadID
    );
  }

  switch (subcmd) {
    case "lock": {
      const nameToLock = args.slice(1).join(" ");
      if (!nameToLock) {
        return api.sendMessage("❗ Lock karne ke liye group ka naam bhi do.", threadID);
      }
      lockedGroupNames[threadID] = nameToLock;
      try {
        await api.setTitle(nameToLock, threadID);
        return api.sendMessage(`🔒 Group name lock ho gaya: ${nameToLock}`, threadID);
      } catch (err) {
        return api.sendMessage("❌ Naam set karne me error aayi.", threadID);
      }
    }

    case "unlock": {
      if (!lockedGroupNames[threadID]) {
        return api.sendMessage("⚠️ Is group me koi name lock nahi hai.", threadID);
      }
      delete lockedGroupNames[threadID];
      return api.sendMessage("🔓 Group name ka lock hata diya gaya.", threadID);
    }

    case "reset": {
      const lockedName = lockedGroupNames[threadID];
      if (!lockedName) {
        return api.sendMessage("⚠️ Is group ke liye koi locked name set nahi hai.", threadID);
      }
      try {
        await api.setTitle(lockedName, threadID);
        return api.sendMessage(`✅ Group name reset kiya gaya: ${lockedName}`, threadID);
      } catch (err) {
        return api.sendMessage("❌ Reset karte waqt error aayi.", threadID);
      }
    }

    default:
      return api.sendMessage("❓ Unknown command. Try: lockname lock/unlock/reset", threadID);
  }
};

module.exports.handleEvent = async ({ event, api }) => {
  const { threadID, logMessageType, logMessageData } = event;

  // Check if group name changed and lock exists
  if (logMessageType === "log:thread-name" && lockedGroupNames[threadID]) {
    const currentName = logMessageData?.name;
    const lockedName = lockedGroupNames[threadID];

    if (currentName !== lockedName) {
      try {
        await api.setTitle(lockedName, threadID);
        api.sendMessage(`⚠️ Group name locked hai. Wapas set kar diya gaya: ${lockedName}`, threadID);
      } catch (err) {
        console.error("❌ Group name reset failed:", err);
      }
    }
  }
};
