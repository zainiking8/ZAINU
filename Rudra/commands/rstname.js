module.exports = {
  config: {
    name: "rstname",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Arun(MirryKal)",
    description: "Reset bot name in group with prefix",
    commandCategory: "group",
    usages: "",
    cooldowns: 5
  },

  run: async function ({ api, event }) {
    const threadID = event.threadID;

    // Ye command sirf group me chale
    if (event.isGroup === false) {
      return api.sendMessage("❌ Ye command sirf group me kaam karegi!", threadID);
    }

    // BOTNAME and PREFIX config se le rahe
    const botName = global.config.BOTNAME || "Bot";
    const prefix = global.config.PREFIX || "!";

    // Nickname format: BOTNAME [ PREFIX ]
    const newNick = `${botName} [ ${prefix} ]`;

    try {
      await api.changeNickname(newNick, threadID, api.getCurrentUserID());
      return api.sendMessage(`✅ Naam reset ho gaya: ${newNick}`, threadID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Naam change karne me error aaya.", threadID);
    }
  }
};
