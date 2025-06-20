module.exports = {
  config: {
    name: "trace",
    version: "1.0",
    author: "Rudra",
    description: "Track mentioned user via tracker link",
    category: "tools",
    role: 0
  },

  onStart: async function ({ api, event }) {
    const mention = Object.keys(event.mentions)[0];
    
    if (!mention)
      return api.sendMessage("⚠️ कृपया किसी को mention करें जिसे track करना है.\nउदाहरण: trace @username", event.threadID);

    const name = event.mentions[mention];
    const link = `https://tracker-rudra.onrender.com/?uid=${mention}`;

    return api.sendMessage({
      body: `🕵️‍♂️ Tracker Link Generated for @${name}:\n🔗 ${link}`,
      mentions: [{ tag: name, id: mention }]
    }, event.threadID);
  }
};
