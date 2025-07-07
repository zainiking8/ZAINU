module.exports.config = {
  name: "unfriend",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Arun Kumar",
  description: "Remove friends by UID or all",
  commandCategory: "system",
  usages: "[uid/all]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const uid = args[0];
  if (!uid) return api.sendMessage("कृपया किसी UID या 'all' लिखें।", event.threadID, event.messageID);

  if (uid.toLowerCase() === "all") {
    try {
      const friends = await api.getFriendsList();
      let count = 0;
      for (const friend of friends) {
        try {
          await api.unfriend(friend.userID);
          count++;
        } catch (err) {
          console.log(`❌ ${friend.userID} को हटाने में समस्या: ${err.message}`);
        }
      }
      return api.sendMessage(`✅ सभी friends हटा दिए गए। कुल: ${count}`, event.threadID, event.messageID);
    } catch (e) {
      return api.sendMessage("❌ Friends लिस्ट प्राप्त करने में त्रुटि।", event.threadID, event.messageID);
    }
  } else {
    try {
      await api.unfriend(uid);
      return api.sendMessage(`✅ UID ${uid} को unfriend कर दिया गया।`, event.threadID, event.messageID);
    } catch (err) {
      return api.sendMessage(`❌ Unfriend करने में समस्या: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
