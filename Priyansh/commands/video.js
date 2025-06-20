const axios = require('axios');
const yts = require("yt-search");

module.exports.config = {
    name: "video2",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mesbah Saxx (converted by Rudra)",
    description: "Download YouTube video via link or song name",
    commandCategory: "media",
    usages: "[YouTube link or song name]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const getStreamFromURL = async (url, pathName) => {
        try {
            const response = await axios.get(url, { responseType: "stream" });
            response.data.path = pathName;
            return response.data;
        } catch (err) {
            throw new Error("Failed to get video stream.");
        }
    };

    const getVideoID = (url) => {
        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
        const match = url.match(checkurl);
        return match ? match[1] : null;
    };

    try {
        let videoID, waitMsg;
        const url = args[0];

        // Get API base URL from remote JSON
        const baseApiRes = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
        const diptoApi = baseApiRes.data.api;

        if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
            videoID = getVideoID(url);
            if (!videoID) {
                return api.sendMessage("❌ Invalid YouTube URL.", event.threadID, event.messageID);
            }
        } else {
            const songName = args.join(" ");
            if (!songName) return api.sendMessage("📌 Please enter a YouTube link or song name.", event.threadID, event.messageID);
            waitMsg = await api.sendMessage(`🔍 Searching for: "${songName}"...`, event.threadID);
            const searchResult = await yts(songName);
            const videoList = searchResult.videos.slice(0, 50);
            if (videoList.length === 0) return api.sendMessage("❌ No video found.", event.threadID, event.messageID);
            const chosenVideo = videoList[Math.floor(Math.random() * videoList.length)];
            videoID = chosenVideo.videoId;
        }

        const res = await axios.get(`${diptoApi}/ytDl3?link=${videoID}&format=mp4`);
        const { title, quality, downloadLink } = res.data;

        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

        const shortUrlRes = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(downloadLink)}`);
        const shortUrl = shortUrlRes.data;

        const msgBody = `🎬 𝗧𝗶𝘁𝗹𝗲: ${title}\n📶 𝗤𝘂𝗮𝗹𝗶𝘁𝘆: ${quality}\n\n📥 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗟𝗶𝗻𝗸: ${shortUrl}`;

        const videoStream = await getStreamFromURL(downloadLink, `${title}.mp4`);

        return api.sendMessage({
            body: msgBody,
            attachment: videoStream
        }, event.threadID, event.messageID);

    } catch (error) {
        console.error("Video2 Error:", error);
        return api.sendMessage(`❌ Error: ${error.message || "Something went wrong."}`, event.threadID, event.messageID);
    }
};
