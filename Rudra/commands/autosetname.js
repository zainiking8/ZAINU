const OWNER_UID = "61550558518720";
global.userNameLocks = global.userNameLocks || {}; // { userID: lockedName }

module.exports.config = {
  name: "autosetname",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rudra x ChatGPT",
  description: "Lock a user's nickname. Bot will auto reset if changed.",
  commandCategory: "group",
  usages: "autosetname lock/unlock/reset @tag [new name]",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { senderID, threadID, mentions } = event;

  if (senderID !== OWNER_UID) {
    return api.sendMessage("❌ Sirf bot ka malik (UID: 61550558518720) is command ko chala sakta hai.", threadID);
  }

  const subcmd = args[0]?.toLowerCase();
  const mentionIDs = Object.keys(mentions);

  if (!["lock", "unlock", "reset"].includes(subcmd) || mentionIDs.length === 0) {
    return api.sendMessage(
      "📌 Usage:\n• autosetname lock @tag <name>\n• autosetname unlock @tag\n• autosetname reset @tag",
      threadID
    );
  }

  const userID = mentionIDs[0];

  switch (subcmd) {
    case "lock":
      const newName = args.slice(2).join(" ");
      if (!newName) return api.sendMessage("❗ Naam bhi do jise lock karna hai.", threadID);
      global.userNameLocks[userID] = newName;
      await api.changeNickname(newName, threadID, userID);
      return api.sendMessage(`🔒 Naam lock ho gaya: ${newName}`, threadID);

    case "unlock":
      if (!global.userNameLocks[userID]) return api.sendMessage("⚠️ Is user ka naam lock nahi hai.", threadID);
      delete global.userNameLocks[userID];
      return api.sendMessage("🔓 Naam unlock kar diya gaya.", threadID);

    case "reset":
      if (!global.userNameLocks[userID]) return api.sendMessage("⚠️ Naam lock nahi mila reset ke liye.", threadID);
      await api.changeNickname(global.userNameLocks[userID], threadID, userID);
      return api.sendMessage(`✅ Naam reset kiya gaya: ${global.userNameLocks[userID]}`, threadID);

    default:
      return api.sendMessage("❓ Command galat hai. Try: autosetname lock/unlock/reset @tag [name]", threadID);
  }
};
