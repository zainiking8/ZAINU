// Riya AI Companion - UID Specific Behavior + Code Generation
const axios = require("axios");
const fs = require("fs");
// const path = require("path"); // If you need path module for file operations, uncomment
// const util = require("util"); // If you need util for promisify or other utilities, uncomment

const userNameCache = {};
let hornyMode = false;

// Make sure ownerUID is correctly set here or globally
const ownerUID = "61550558518720"; // <-- CONFIRM THIS UID IS CORRECT

// Confirm that global.config.VOICE_RSS_API_KEY is available and set
// Example: In your bot's main config.js file: global.config = { VOICE_RSS_API_KEY: "YOUR_VOICERSS_API_KEY" };
// OR set it directly here if this is a standalone file and you prefer:
const VOICE_RSS_API_KEY = global.config?.VOICE_RSS_API_KEY || "YOUR_VOICERSS_API_KEY_HERE"; // Replace with your actual VoiceRSS key

async function getVoiceReply(text, langCode = 'hi-in') {
    if (!VOICE_RSS_API_KEY || VOICE_RSS_API_KEY === "YOUR_VOICERSS_API_KEY_HERE") {
        console.error("VoiceRSS API key is not set. Skipping voice reply.");
        return null;
    }
    const voiceApiUrl = `https://api.voicerss.org/?key=${VOICE_RSS_API_KEY}&hl=${langCode}&src=${encodeURIComponent(text)}`;
    try {
        const response = await axios.get(voiceApiUrl, { responseType: 'arraybuffer' });
        const audioData = response.data;
        const audioPath = `./voice_reply_${Date.now()}.mp3`; // Use a unique name
        fs.writeFileSync(audioPath, audioData);
        return audioPath;
    } catch (error) {
        console.error("Error generating voice reply:", error);
        return null;
    }
}

async function getGIF(query) {
    const giphyApiKey = "dc6zaTOxFJmzC"; // This is a public beta key, might have rate limits
    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(query)}&limit=1`;
    try {
        const response = await axios.get(giphyUrl);
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data[0]?.images?.original?.url;
        } else {
            console.log("No GIF found for query:", query);
            return null;
        }
    } catch (error) {
        console.error("Error fetching GIF:", error);
        return null;
    }
}

module.exports.config = {
    name: "Riya",
    version: "2.8.1",
    hasPermssion: 0,
    credits: "Rudra + API from Angel code + Logging & User Name by Gemini + Code Generation Ability + Personality & Multi-language Enhanced by User Request",
    description: "Riya, your AI companion: modern, smart, flirty with users, roasts playfully, and super respectful to Owner. UID specific behavior. Responds only when triggered. Modified for 3-4 line replies (with code exceptions). Understands and replies in Hinglish across various Indian languages.",
    commandCategory: "AI-Companion",
    usages: "Riya [आपका मैसेज] / Riya code [आपका कोड प्रॉम्प्ट] (Owner Only) / Reply to Riya",
    cooldowns: 2,
};

const chatHistories = {};
const AI_API_URL = "https://rudra-here-9xz2.onrender.com"; // <-- CONFIRM THIS URL IS CORRECT

async function getUserName(api, userID) {
    if (userNameCache[userID]) {
        return userNameCache[userID];
    }
    try {
        const userInfo = await api.getUserInfo(userID);
        if (userInfo && userInfo[userID] && userInfo[userID].name) {
            const name = userInfo[userID].name;
            userNameCache[userID] = name;
            return name;
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
    }
    if (userID === ownerUID) {
        return "Boss";
    }
    return "yaar"; // Default name for non-owner if API fails
}

module.exports.run = async function () {};

async function toggleHornyMode(body, senderID) {
    if (body.toLowerCase().includes("horny mode on") || body.toLowerCase().includes("garam mode on")) {
        hornyMode = true;
        return "Alright, horny mode's ON. Let's get naughty and wild! 😈🔥";
    } else if (body.toLowerCase().includes("horny mode off") || body.toLowerCase().includes("garam mode off")) {
        hornyMode = false;
        return "Okay, switching back to our usual charming style. 😉";
    }
    return null;
}

// Removed the redundant detectLanguage function as server handles it.
// function detectLanguage(text) {
//     return "hi-in"; // This was causing the issue. Server will detect.
// }

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const { threadID, messageID, senderID, body, messageReply } = event;

        const isRiyaTrigger = body?.toLowerCase().startsWith("riya");
        const isReplyToRiya = messageReply?.senderID === api.getCurrentUserID();

        // If not triggered by "riya" or not a reply to Riya, exit
        if (!(isRiyaTrigger || isReplyToRiya)) {
            return;
        }

        console.log("--- Riya HandleEvent ---");
        console.log("Riya's Bot ID:", api.getCurrentUserID());
        console.log("Sender ID:", senderID);
        console.log("Is Owner UID:", senderID === ownerUID);
        console.log("Message Body:", body);
        console.log("-----------------------");

        let userMessageRaw;
        let isExplicitCodeRequest = false;

        if (isRiyaTrigger) {
            userMessageRaw = body.slice(4).trim();
        } else {
            userMessageRaw = body.trim();
        }

        // --- Handle Code Generation Request ---
        if (userMessageRaw.toLowerCase().startsWith("code ")) {
            isExplicitCodeRequest = true;
            userMessageRaw = userMessageRaw.slice(5).trim(); // Get the actual code prompt after "code "

            if (senderID !== ownerUID) {
                api.sendTypingIndicator(threadID, false);
                const userName = await getUserName(api, senderID);
                return api.sendMessage(
                    `माफ़ करना ${userName}, यह कोड जनरेशन कमांड केवल मेरे Boss (${await getUserName(api, ownerUID)}) के लिए है। 😉`,
                    threadID,
                    messageID
                );
            }

            if (!userMessageRaw) { // userMessageRaw is now the actual code prompt
                api.sendTypingIndicator(threadID, false);
                return api.sendMessage("क्या कोड चाहिए? 'Riya code [आपका प्रॉम्प्ट]' ऐसे लिखो।", threadID, messageID);
            }
        }

        const userName = await getUserName(api, senderID);

        // --- Handle Horny Mode Toggle ---
        let hornyModeToggleResponse = await toggleHornyMode(body, senderID);
        if (hornyModeToggleResponse) {
            api.sendMessage(hornyModeToggleResponse, threadID, messageID);
            return; // Exit after handling toggle
        }

        // --- Handle Empty Message after Trigger ---
        if (!userMessageRaw) {
            api.sendTypingIndicator(threadID, false);
            if (senderID === ownerUID) {
                return api.sendMessage(`Hey Boss ${userName}! Kya hukm hai mere ${userName}? 🥰`, threadID, messageID);
            } else {
                return api.sendMessage(`Hello ${userName}. Bolo kya kaam hai? 😉`, threadID, messageID);
            }
        }

        api.sendTypingIndicator(threadID, true);

        // --- Prepare data for Proxy Server ---
        // We only send the raw user message, senderID, and isOwner to the server.
        // The server will handle language detection, personality prompts, and history.
        const requestData = {
            prompt: userMessageRaw, // This is the ONLY thing the server needs for the prompt
            senderID: senderID,
            isOwner: isOwner
        };

        try {
            // Send request to your proxy server
            const res = await axios.post(AI_API_URL, requestData); // Send requestData object
            let botReply = res.data?.text?.trim();
            let receivedVoiceLangCode = res.data?.voiceLangCode || 'hi-in'; // Server will send the detected voice language

            // If the response starts with "User:" or "Riya:", remove it
            if (botReply.toLowerCase().startsWith("user:")) {
                botReply = botReply.substring("user:".length).trim();
            }
            if (botReply.toLowerCase().startsWith("riya:")) {
                botReply = botReply.substring("riya:".length).trim();
            }

            // --- Handle Code Generation Response Display ---
            if (isExplicitCodeRequest) {
                // For code, no need for 3-4 lines limit, just send the full code
                // No chat history update for code generation as it's a direct request
            } else {
                // For regular chat, manage history and limit lines if needed
                if (!chatHistories[senderID]) chatHistories[senderID] = [];
                chatHistories[senderID].push(`User: ${userMessageRaw}`); // Store raw user message in history
                while (chatHistories[senderID].length > 10) {
                    chatHistories[senderID].shift();
                }

                const lines = botReply.split('\n').filter(line => line.trim() !== '');
                // Apply 3-4 line limit for non-code responses
                if (lines.length > 4 && !botReply.includes('```')) { // Check for code block using ```
                    botReply = lines.slice(0, 4).join('\n') + '...';
                }
                chatHistories[senderID].push(`Riya: ${botReply}`); // Store Riya's formatted reply
            }

            // --- Get and Send Voice Reply ---
            let voiceFilePath = await getVoiceReply(botReply, receivedVoiceLangCode); // Use received language code
            if (voiceFilePath) {
                api.sendMessage({ attachment: fs.createReadStream(voiceFilePath) }, threadID, (err) => {
                    if (err) console.error("Error sending voice message:", err);
                    if (fs.existsSync(voiceFilePath)) {
                        fs.unlinkSync(voiceFilePath);
                    }
                });
            }

            // --- Get and Send GIF ---
            let gifQuery = "modern fun sassy";
            if (isExplicitCodeRequest) {
                gifQuery = "coding programmer"; // Specific GIF for code requests
            } else if (senderID === ownerUID) {
                gifQuery = hornyMode ? "flirty love hot" : "charming and fun";
            } else {
                gifQuery = hornyMode ? "flirty sassy fun" : "cool witty modern";
            }
            let gifUrl = await getGIF(gifQuery);
            if (gifUrl) {
                api.sendMessage({ attachment: await axios.get(gifUrl, { responseType: 'stream' }).then(res => res.data) }, threadID, (err) => {
                    if (err) console.error("Error sending GIF:", err);
                });
            }

            // --- Prepare and Send Text Reply ---
            let replyText = "";
            if (isExplicitCodeRequest) {
                replyText = botReply; // Send full code reply
            } else if (senderID === ownerUID) {
                if (hornyMode) {
                     replyText = `${botReply} 😉🔥💋\n\n_Your charmingly naughty Riya... 😉_`;
                } else {
                     replyText = `${botReply} 😊💖✨`;
                }
            } else {
                if (hornyMode) {
                      replyText = `${botReply} 😏💅🔥`;
                 } else {
                      replyText = `${botReply} 😉👑`;
                 }
            }

            api.sendTypingIndicator(threadID, false);

            if (isReplyToRiya && messageReply) {
                return api.sendMessage(replyText, threadID, messageReply.messageID);
            } else {
                return api.sendMessage(replyText, threadID, messageID);
            }

        } catch (apiError) {
            console.error("Riya AI API Error:", apiError);
            api.sendTypingIndicator(threadID, false);
            if (senderID === ownerUID) {
                 return api.sendMessage(`Ugh, API mein kuch glitch hai Boss ${userName}... Thodi der mein try karte hain cool? 😎`, threadID, messageID);
            } else {
                 return api.sendMessage(`Server down hai ya API ka mood off. Baad mein aana. 😒`, threadID, messageID);
            }
        }

    } catch (err) {
        console.error("Riya Bot Catch-all Error:", err);
        let fallbackUserName = "Boss";
        if (event && event.senderID) {
            try {
                fallbackUserName = await getUserName(api, event.senderID);
            } catch (nameError) {
                console.error("Error fetching username in catch-all:", nameError);
                if (event.senderID !== ownerUID) fallbackUserName = "yaar";
            }
        } else if (event && event.senderID !== ownerUID) {
            fallbackUserName = "yaar";
        }

        if (event && event.threadID) {
            api.sendTypingIndicator(event.threadID, false);
        }
        const replyToMessageID = event && event.messageID ? event.messageID : null;
         if (event && event.senderID === ownerUID) {
             return api.sendMessage(`Argh, mere system mein kuch problem aa gayi Boss ${fallbackUserName}! Baad mein baat karte hain... 😅`, event.threadID, replyToMessageID);
         } else {
             return api.sendMessage(`System glitchy ho raha hai, ${fallbackUserName}. Thoda break le lo. 🙄`, event.threadID, replyToMessageID);
         }
    }
};
