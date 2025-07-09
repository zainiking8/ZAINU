const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "imdb",
    version: "1.0.6",
    hasPermission: 0,
    credits: "MirryKal",
    description: "Find movie or series details from IMDb",
    commandCategory: "search",
    usages: "[movie/series name]",
    cooldowns: 3
};

module.exports.run = async ({ event, args, api }) => {
    if (!args.length) {
        return api.sendMessage("❗ कृपया कोई फ़िल्म या सीरीज़ का नाम दर्ज करें!", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const apiKey = "8f50e26e"; // अपना IMDb API Key डालें
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.Response === "False") {
            return api.sendMessage(`❌ IMDb पर *${query}* से संबंधित कोई जानकारी नहीं मिली।`, event.threadID, event.messageID);
        }

        // 🎬 पहले Movie Info भेजें
        const message = `🎬 *${data.Title}* (${data.Year})\n⭐ IMDB रेटिंग: ${data.imdbRating}/10\n🎭 Genre: ${data.Genre}\n🎬 डायरेक्टर: ${data.Director}\n📜 कहानी: ${data.Plot}\n🌍 देश: ${data.Country}\n\n🔗 IMDb: https://www.imdb.com/title/${data.imdbID}/`;
        api.sendMessage(message, event.threadID, event.messageID);

        // 🎥 अगर Poster मौजूद है तो डाउनलोड और भेजें
        if (data.Poster && data.Poster !== "N/A") {
            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir); // अगर cache फोल्डर नहीं है तो बना लो

            const filePath = path.join(cacheDir, `${data.Title.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`);

            const writer = fs.createWriteStream(filePath);
            const imageResponse = await axios({
                url: data.Poster,
                method: "GET",
                responseType: "stream"
            });

            imageResponse.data.pipe(writer);

            writer.on("finish", () => {
                api.sendMessage({ body: "🎞 Movie Poster:", attachment: fs.createReadStream(filePath) }, event.threadID, () => {
                    setTimeout(() => {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("❌ Poster delete failed:", err);
                        });
                    }, 5000); // 5 सेकंड बाद ऑटो-डिलीट
                });
            });

            writer.on("error", (err) => {
                console.error(err);
                api.sendMessage("⚠️ Poster डाउनलोड करने में समस्या आ रही है!", event.threadID, event.messageID);
            });
        }
    } catch (error) {
        console.error(error);
        return api.sendMessage("⚠️ IMDb API से डेटा लाने में समस्या हो रही है। बाद में पुनः प्रयास करें!", event.threadID, event.messageID);
    }
};
