const OWNER_UID = "61550558518720";
const groupNameLock = require("../events/groupNameLock"); // Event ko import karo

module.exports.config = {
  name: "lockname",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rudra x ChatGPT",
  description: "Lock group name. If changed, bot resets it. Owner-only.",
  commandCategory: "group",
  usages: "lockname [lock/unlock/reset] [name]",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID } = event;

  if (senderID !== OWNER_UID) return api.sendMessage(
    "⛔ Sirf bot ka malik (UID: 61550558518720) yeh command chala sakta hai.", threadID
  );

  const subcmd = args[0]?.toLowerCase();

  switch (subcmd) {
    case "lock":
      if (!args[1]) return api.sendMessage("❗ Lock karne ke liye naam bhi do.\n📌 Example: lockname lock Rudra Army", threadID);
      const nameToLock = args.slice(1).join(" ");
      groupNameLock.setLockedName(threadID, nameToLock);
      await api.setTitle(nameToLock, threadID);
      return api.sendMessage(`🔒 Group name ab lock ho gaya hai: ${nameToLock}`, threadID);

    case "unlock":
      if (!groupNameLock.getLockedName(threadID)) return api.sendMessage("⚠️ Is group me koi name lock nahi hai.", threadID);
      groupNameLock.removeLockedName(threadID);
      return api.sendMessage("🔓 Group name ka lock hata diya gaya.", threadID);

    case "reset":
      const lockedName = groupNameLock.getLockedName(threadID);
      if (!lockedName) return api.sendMessage("⚠️ Is group ke liye koi locked name set nahi hai.", threadID);
      await api.setTitle(lockedName, threadID);
      return api.sendMessage(`✅ Group name wapas reset kiya gaya: ${lockedName}`, threadID);

    default:
      return api.sendMessage(
        "📌 Usage:\n• lockname lock <group name>\n• lockname unlock\n• lockname reset", threadID
      );
  }
};
