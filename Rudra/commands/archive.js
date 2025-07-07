const axios = require("axios");
const fs = require("fs");
const path = require("path");

const userCache = new Map();

function deleteAfterTimeout(filePath, timeout = 5000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }, timeout);
}

function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

module.exports = {
  config: {
    name: "archive",
    version: "2.0",
    hasPermission: 0,
    credits: "Mirrykal + ChatGPT",
    description: "Search/download videos, music, docs, apk, images from archive.org",
    commandCategory: "media",
    usages: "<type> <query>",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    const type = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");
    const validTypes = ["video", "music", "doc", "apk", "image"];

    if (!validTypes.includes(type) || !query)
      return api.sendMessage(`❌ Usage:\narchive <${validTypes.join("|")}> <query>`, event.threadID);

    const typeMap = {
      video: "movies",
      music: "audio",
      doc: "texts",
      apk: "software",
      image: "image",
    };

    const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
      query
    )}+AND+mediatype:${typeMap[type]}&fl[]=identifier,title,description,downloads&rows=5&page=1&output=json`;

    try {
      const res = await axios.get(searchUrl);
      const items = res.data.response.docs;

      if (!items.length) return api.sendMessage("❌ Koi result nahi mila!", event.threadID);

      userCache.set(event.senderID, { type, results: items });

      const list = items.map((item, i) => `${i + 1}. ${item.title}`).join("\n");

      api.sendMessage(
        `📦 Top 5 ${type} results for "${query}":\n\n${list}\n\n👉 Reply with 1–5 to select.`,
        event.threadID,
        (err, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            type: "select",
            author: event.senderID,
            messageID: info.messageID,
          });
        }
      );
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Error while searching archive.org", event.threadID);
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;

    const choice = event.body.trim();
    if (!/^[1-5]$/.test(choice)) return api.sendMessage("⚠️ Sirf 1–5 likho bina kuch aur ke.", event.threadID);

    const index = parseInt(choice) - 1;
    const { type, results } = userCache.get(event.senderID) || {};
    if (!results || !results[index]) return api.sendMessage("❌ Data expired ya galat selection.", event.threadID);

    const item = results[index];
    const metaUrl = `https://archive.org/metadata/${item.identifier}`;

    try {
      const metaRes = await axios.get(metaUrl);
      const files = metaRes.data.files;
      let file, fileUrl, duration = 0;

      if (type === "video") {
        file = files.find(f => f.format?.includes("MPEG4"));
        duration = parseFloat(file?.length || 0);
      } else if (type === "music") {
        file = files.find(f => f.format?.includes("MP3"));
        duration = parseFloat(file?.length || 0);
      } else if (type === "doc") {
        const docFiles = files.filter(f => /\.(pdf|zip|docx?|epub)$/i.test(f.name));
        if (!docFiles.length) return api.sendMessage("❌ Koi document file nahi mila.", event.threadID);
        const links = docFiles.map(f => `📄 ${f.name}\n🔗 https://archive.org/download/${item.identifier}/${f.name}`);
        return api.sendMessage(`📚 Documents:\n\n${links.join("\n\n")}`, event.threadID);
      } else if (type === "apk") {
        file = files.find(f => /\.apk$/i.test(f.name));
        if (!file) return api.sendMessage("❌ Koi APK file nahi mili.", event.threadID);
        fileUrl = `https://archive.org/download/${item.identifier}/${file.name}`;
        return api.sendMessage(`📱 APK Download:\n${item.title}\n🔗 ${fileUrl}`, event.threadID);
      } else if (type === "image") {
        file = files.find(f => /\.(jpe?g|png)$/i.test(f.name));
        if (!file) return api.sendMessage("❌ Image file nahi mili.", event.threadID);
        fileUrl = `https://archive.org/download/${item.identifier}/${file.name}`;
        const ext = file.name.split(".").pop();
        const filePath = path.join(__dirname, "cache", `img_${Date.now()}.${ext}`);
        const res = await axios({ url: fileUrl, responseType: "stream" });
        const writer = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          res.data.pipe(writer);
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
        await api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID);
        return deleteAfterTimeout(filePath);
      }

      if (!file) return api.sendMessage("❌ Compatible file nahi mila.", event.threadID);

      fileUrl = `https://archive.org/download/${item.identifier}/${file.name}`;
      const ext = file.name.split(".").pop();
      const fileName = `archive_${Date.now()}.${ext}`;
      const filePath = path.join(__dirname, "cache", fileName);

      if (
        (type === "video" && duration <= 900) ||
        (type === "music" && duration <= 900)
      ) {
        const stream = await axios({ url: fileUrl, responseType: "stream" });
        const writer = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          stream.data.pipe(writer);
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        await api.sendMessage({
          body: `📥 ${item.title}\n🕒 ${formatSeconds(duration)}\n✅ File attached.`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        deleteAfterTimeout(filePath);
      } else {
        await api.sendMessage(
          `📦 ${item.title}\n🕒 ${formatSeconds(duration)}\n🔗 ${fileUrl}`,
          event.threadID
        );
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error loading file data.", event.threadID);
    }
  }
};
