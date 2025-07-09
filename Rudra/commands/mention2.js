module.exports.config = {
  name: "mentionbot",
  version: "1.0.0-beta-fixbyDungUwU",
  hasPermssion: 0,
  credits: "Fixed By Arun",
  description: "Bot will rep ng tag admin or rep ng tagbot ",
  commandCategory: "Other",
  usages: "",
  cooldowns: 1
};
module.exports.handleEvent = function({ api, event }) {
  if (event.senderID !== "61551225242006") {
    var aid = ["61551225242006","61551225242006"];
    for (const id of aid) {
    if ( Object.keys(event.mentions) == id) {
      var msg = ["Mujhe Tang Mat Karo😒", "Mujhe mt bulao, me janu ke sath busy hu🙈", "Bola Na mention Mat Kar, Dur Rho🫡", "kya hua kyu chilla rahe ho😒😒", "Haye mujhe Sharam ati hai🙈 ese mat bulao", "chup😒😒😒", "Bolo na Jaanu" , "Haa jaan Bulaya kya" , "Boliye mere sarkar 🐥"];
      return api.sendMessage({body: msg[Math.floor(Math.random()*msg.length)]}, event.threadID, event.messageID);
    }
    }}
};
module.exports.run = async function({}) {
        }
