// Riya AI Companion - UID Specific Behavior + Code Generation
const axios = require("axios");
const fs = require("fs");
// const path = require("path"); // If you need path module for file operations, uncomment
// const util = require("util"); // If you need util for promisify or other utilities, uncomment

const userNameCache = {};
let hornyMode = false;

// === SET YOUR OWNER UID HERE ===
// महत्वपूर्ण: अपना Facebook UID यहां अपडेट करें!
// <-- CHANGE THIS: Apni sahi UID yahan daalo
const ownerUID = "61550558518720"; // CONFIRM THIS IS YOUR ACTUAL UID
// ==============================

// Function to generate voice reply (using VoiceRSS API)
async function getVoiceReply(text, langCode = 'hi-in') { // <-- langCode parameter add kiya
    // महत्वपूर्ण: आपको YOUR_API_KEY को अपनी VoiceRSS API Key से बदलना होगा
    // IMPORTANT: Replace YOUR_API_KEY with your VoiceRSS API Key
    // <-- CHANGE THIS: Apni sahi VoiceRSS API Key yahan daalo
    const VOICE_RSS_API_KEY = "YOUR_VOICERSS_API_KEY_HERE"; // Agar global.config.VOICE_RSS_API_KEY nahi set hai to yahan daalo

    if (!VOICE_RSS_API_KEY || VOICE_RSS_API_KEY === "YOUR_VOICERSS_API_KEY_HERE" || VOICE_RSS_API_KEY.includes("YOUR_")) {
        console.error("VoiceRSS API key is not set or is default. Skipping voice reply.");
        return null;
    }
    // <-- langCode variable ka upyog
    const voiceApiUrl = `https://api.voicerss.org/?key=${VOICE_RSS_API_KEY}&hl=${langCode}&src=${encodeURIComponent(text)}`;
    try {
        const response = await axios.get(voiceApiUrl, { responseType: 'arraybuffer' });
        const audioData = response.data;
        // <-- Unique file name use karo
        const audioPath = `./voice_reply_${Date.now()}.mp3`;
        fs.writeFileSync(audioPath, audioData);
        return audioPath;
    } catch (error) {
        console.error("Error generating voice reply:", error);
        return null;
    }
}

// Function to get a GIF from Giphy API
async function getGIF(query) {
    const giphyApiKey = "dc6zaTOxFJmzC"; // Working Giphy API key (free key, limited usage)
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
    version: "2.8.2", // Updated version for this URL fix
    hasPermssion: 0,
    credits: "Rudra + API from Angel code + Logging & User Name by Gemini + Code Generation Ability + Personality & Multi-language Enhanced by User Request",
    description: "Riya, your AI companion: modern, smart, flirty with users, roasts playfully, and super respectful to Owner. UID specific behavior. Responds only when triggered. Modified for 3-4 line replies (with code exceptions). Understands and replies in Hinglish across various Indian languages.",
    commandCategory: "AI-Companion",
    usages: "Riya [आपका मैसेज] / Riya code [आपका कोड प्रॉम्प्ट] (Owner Only) / Reply to Riya",
    cooldowns: 2,
};

const chatHistories = {}; // Chat history for client-side context (not sent to server anymore)
// <-- CHANGE THIS: Naya Render server URL yahan confirmed hai
const AI_API_URL = "https://rudra-here-9xz2.onrender.com"; // Your new proxy server URL
// ==============================

async function getUserName(api, userID) {
    // Debugging logs for getUserName
    console.log(`[DEBUG] getUserName called for userID: ${userID}`);
    if (userNameCache[userID]) {
        console.log(`[DEBUG] Returning name from cache: ${userNameCache[userID]} for ${userID}`);
        return userNameCache[userID];
    }
    try {
        const userInfo = await api.getUserInfo(userID);
        // console.log("[DEBUG] getUserInfo raw response:", JSON.stringify(userInfo, null, 2)); // Detailed log for debugging
        if (userInfo && userInfo[userID] && userInfo[userID].name) {
            const name = userInfo[userID].name;
            userNameCache[userID] = name;
            console.log(`[DEBUG] Fetched and cached name: ${name} for ${userID}`);
            return name;
        }
    } catch (error) {
        console.error(`[ERROR] Error fetching user info for ${userID} in getUserName:`, error);
        // Possible reasons: Bot doesn't have permission, network issue, or Facebook API change
    }

    // Fallback names
    if (userID === ownerUID) {
        console.log(`[DEBUG] Returning 'Boss' as fallback for ownerUID: ${userID}`);
        return "Boss";
    }
    console.log(`[DEBUG] Returning 'yaar' as fallback for non-owner/failed lookup: ${userID}`);
    return "yaar"; // Default fallback for non-owner
}

module.exports.run = async function () {};

async function toggleHornyMode(body) { // No senderID needed here
    if (body.toLowerCase().includes("horny mode on") || body.toLowerCase().includes("garam mode on")) {
        hornyMode = true;
        return "Alright, horny mode's ON. Let's get naughty and wild! 😈🔥";
    } else if (body.toLowerCase().includes("horny mode off") || body.toLowerCase().includes("garam mode off")) {
        hornyMode = false;
        return "Okay, switching back to our usual charming style. 😉";
    }
    return null;
}

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const { threadID, messageID, senderID, body, messageReply } = event;

        const isRiyaTrigger = body?.toLowerCase().startsWith("riya");
        const isReplyToRiya = messageReply?.senderID === api.getCurrentUserID();

        if (!(isRiyaTrigger || isReplyToRiya)) {
            return; // Ignore messages that are not triggers
        }

        console.log("--- Riya Bot HandleEvent Triggered ---");
        console.log(`Bot ID: ${api.getCurrentUserID()}`);
        console.log(`Sender ID: ${senderID}`);
        console.log(`Is Owner (${ownerUID}): ${senderID === ownerUID}`);
        console.log(`Raw Message Body: "${body}"`);
        console.log("-------------------------------------");

        let userMessageRaw; // This is the user's actual message
        let isExplicitCodeRequest = false;

        // Extract message after "riya" trigger
        if (isRiyaTrigger) {
            userMessageRaw = body.slice(4).trim();
        } else { // It's a reply to Riya
            userMessageRaw = body.trim();
        }

        // --- Handle Code Generation Command ---
        if (userMessageRaw.toLowerCase().startsWith("code ")) {
            isExplicitCodeRequest = true;
            // Send the raw code prompt to the server, prefixed for server-side handling
            userMessageRaw = `CODE_GEN_REQUEST: ${userMessageRaw.slice(5).trim()}`;

            if (senderID !== ownerUID) {
                api.sendTypingIndicator(threadID, false);
                const userNameForReply = await getUserName(api, senderID);
                return api.sendMessage(
                    `माफ़ करना ${userNameForReply}, यह कोड जनरेशन कमांड केवल मेरे Boss (${await getUserName(api, ownerUID)}) के लिए है। 😉`,
                    threadID,
                    messageID
                );
            }

            if (!userMessageRaw.trim().replace('CODE_GEN_REQUEST:', '')) {
                api.sendTypingIndicator(threadID, false);
                return api.sendMessage("क्या कोड चाहिए? 'Riya code [आपका प्रॉम्प्ट]' ऐसे लिखो।", threadID, messageID);
            }
        }

        const userName = await getUserName(api, senderID); // Get user's name

        // --- Handle Horny Mode Toggle ---
        let hornyModeToggleResponse = await toggleHornyMode(body);
        if (hornyModeToggleResponse) {
            api.sendMessage(hornyModeToggleResponse, threadID, messageID);
            api.sendTypingIndicator(threadID, false);
            return;
        }

        // --- Handle Empty Message after Trigger (e.g., just "Riya") ---
        if (!userMessageRaw || userMessageRaw.trim() === '') {
            api.sendTypingIndicator(threadID, false);
            if (senderID === ownerUID) {
                return api.sendMessage(`Hey Boss ${userName}! Kya hukm hai mere ${userName}? 🥰`, threadID, messageID);
            } else {
                return api.sendMessage(`Hello ${userName}. Bolo kya kaam hai? 😉`, threadID, messageID);
            }
        }

        api.sendTypingIndicator(threadID, true); // Show typing indicator

        // --- Client-side Chat History Management (not sent to server) ---
        if (!isExplicitCodeRequest) {
            if (!chatHistories[senderID]) chatHistories[senderID] = [];
            chatHistories[senderID].push(`User: ${userMessageRaw}`);
            while (chatHistories[senderID].length > 10) {
                chatHistories[senderID].shift();
            }
        }

        // --- Prepare Data for Proxy Server ---
        // Server expects only the raw user message, senderID, and isOwner.
        // It will handle personality, language detection, and context itself.
        const requestData = {
            prompt: userMessageRaw, // This is the ONLY message content the server needs
            senderID: senderID,
            isOwner: senderID === ownerUID // Boolean flag for owner
        };

        try {
            console.log(`[DEBUG] Sending request to AI_API_URL: ${AI_API_URL} with data:`, JSON.stringify(requestData));
            const res = await axios.post(AI_API_URL, requestData);
            let botReply = res.data?.text?.trim();
            // <-- Server se voiceLangCode receive karein
            let receivedVoiceLangCode = res.data?.voiceLangCode || 'hi-in'; // Fallback to hi-in if not provided

            console.log(`[DEBUG] Received botReply: "${botReply}"`);
            console.log(`[DEBUG] Received voiceLangCode: "${receivedVoiceLangCode}"`);

            // Clean up any "User:" or "Riya:" prefixes from AI response
            if (botReply.toLowerCase().startsWith("user:")) {
                botReply = botReply.substring("user:".length).trim();
            }
            if (botReply.toLowerCase().startsWith("riya:")) {
                botReply = botReply.substring("riya:".length).trim();
            }

            // --- Apply 3-4 Line Limit for Non-Code Responses ---
            if (!isExplicitCodeRequest) {
                const lines = botReply.split('\n').filter(line => line.trim() !== '');
                if (lines.length > 4 && !botReply.includes('```')) { // Don't truncate if it contains a code block
                    botReply = lines.slice(0, 4).join('\n') + '...';
                }
                chatHistories[senderID].push(`Riya: ${botReply}`); // Store formatted reply in history
            }

            // --- Get and Send Voice Reply ---
            let voiceFilePath = null;
            if (VOICE_RSS_API_KEY && VOICE_RSS_API_KEY !== "YOUR_VOICERSS_API_KEY_HERE" && !VOICE_RSS_API_KEY.includes("YOUR_")) {
                 voiceFilePath = await getVoiceReply(botReply, receivedVoiceLangCode); // Pass received langCode
            } else {
                console.warn("[WARN] VoiceRSS API Key missing/invalid/default. Skipping voice generation.");
            }
           
            if (voiceFilePath) {
                api.sendMessage({ attachment: fs.createReadStream(voiceFilePath) }, threadID, (err) => {
                    if (err) console.error("Error sending voice message:", err);
                    if (fs.existsSync(voiceFilePath)) {
                        fs.unlinkSync(voiceFilePath); // Clean up the audio file
                    }
                });
            }

            // --- Get and Send GIF ---
            let gifQuery = "modern fun sassy";
            if (isExplicitCodeRequest) {
                gifQuery = "coding programmer";
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
            } else { // Non-owner
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
            console.error("Riya AI API (Proxy Server) Error:", apiError);
            api.sendTypingIndicator(threadID, false);
            if (senderID === ownerUID) {
                 return api.sendMessage(`Ugh, Boss ${userName}, API mein kuch glitch hai. Server ya network mein problem lag rahi hai... Thodi der mein try karte hain? 😎`, threadID, messageID);
            } else {
                 return api.sendMessage(`Server down hai ya API ka mood off, ${userName}. Baad mein aana. 😒`, threadID, messageID);
            }
        }

    } catch (err) {
        // Catch-all block for any unexpected errors in handleEvent
        console.error("Riya Bot Catch-all Error in handleEvent:", err);
        let fallbackUserName = "Boss"; // Default fallback for owner
        if (event && event.senderID) {
            try {
                fallbackUserName = await getUserName(api, event.senderID);
            } catch (nameError) {
                console.error("Error fetching username for fallback message in catch-all:", nameError);
                if (event.senderID !== ownerUID) fallbackUserName = "yaar"; // If name fetch failed and not owner
            }
        } else if (event && event.senderID !== ownerUID) {
            fallbackUserName = "yaar"; // If event.senderID is missing but not ownerUID
        }

        if (event && event.threadID) {
            api.sendTypingIndicator(event.threadID, false);
        }
        const replyToMessageID = event && event.messageID ? event.messageID : null;

        // Owner aur non-owner ke liye alag error message
         if (event && event.senderID === ownerUID) {
             return api.sendMessage(`Argh, mere system mein kuch problem aa gayi Boss ${fallbackUserName}! Baad mein baat karte hain... 😅`, event.threadID, replyToMessageID);
         } else {
             return api.sendMessage(`System glitchy ho raha hai, ${fallbackUserName}. Thoda break le lo. 🙄`, event.threadID, replyToMessageID);
         }
    }
};
