// Riya AI Companion - UID Specific Behavior + Code Generation + Multi-Indian Language
const axios = require("axios");
const fs = require("fs");
const languageDetect = require('@sindresorhus/language-detect'); // Language detection library

// User name cache to avoid fetching name repeatedly
const userNameCache = {};
let hornyMode = false; // Default mode

// === SET YOUR OWNER UID HERE ===
// महत्वपूर्ण: अपना Facebook UID यहां अपडेट करें!
const ownerUID = "61550558518720"; // <-- अपना UID यहां डालें
// ==============================

// Function to generate voice reply (using Google TTS or any other API)
async function getVoiceReply(text, langCode = 'hi-in') { // Added langCode parameter
    // महत्वपूर्ण: आपको YOUR_API_KEY को अपनी VoiceRSS API Key से बदलना होगा
    // IMPORTANT: Replace YOUR_API_KEY with your VoiceRSS API Key
    const voiceApiUrl = `https://api.voicerss.org/?key=YOUR_API_KEY&hl=${langCode}&src=${encodeURIComponent(text)}`;
    try {
        const response = await axios.get(voiceApiUrl, { responseType: 'arraybuffer' });
        const audioData = response.data;
        const audioPath = './voice_reply.mp3';
        fs.writeFileSync(audioPath, audioData);  // Save to local MP3 file
        return audioPath;
    } catch (error) {
        console.error(`Error generating voice reply for lang ${langCode}:`, error.message);
        console.warn(`VoiceRSS may not support ${langCode}. Falling back to default or skipping voice.`);
        return null;
    }
}

// Function to get a GIF from Giphy API (working API integrated)
async function getGIF(query) {
    const giphyApiKey = "dc6zaTOxFJmzC";  // Working Giphy API key (free key, limited usage)
    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(query)}&limit=1`;
    try {
        const response = await axios.get(giphyUrl);
        // Check if data exists before accessing properties
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data[0]?.images?.original?.url;
        } else {
            console.log("No GIF found for query:", query);
            return null; // Return null if no GIF is found
        }
    } catch (error) {
        console.error("Error fetching GIF:", error);
        return null;
    }
}

module.exports.config = {
    name: "Riya",
    version: "2.9.0", // Updated version for final multi-language changes
    hasPermssion: 0,
    credits: "Rudra + API from Angel code + Logging & User Name by Gemini + Code Generation Ability + Personality & Multi-language Enhanced by User Request",
    description: "Riya, your AI companion: modern, smart, flirty with users, roasts playfully, and super respectful to Owner. UID specific behavior. Responds only when triggered. Modified for 3-4 line replies (with code exceptions). Speaks in user's preferred language (Hinglish/Punjabi/etc.).",
    commandCategory: "AI-Companion",
    usages: "Riya [आपका मैसेज] / Riya code [आपका कोड प्रॉम्प्ट] (Owner Only) / Reply to Riya",
    cooldowns: 2,
};

const chatHistories = {};
const AI_API_URL = "https://rudra-here-9xz2.onrender.com"; // <-- Render server URL

// User name cache to avoid fetching name repeatedly
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
    return "yaar";
}

module.exports.run = async function () {};

// Toggle mode logic remains the same, applies to everyone
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

// Function to detect language using a robust library
async function detectLanguage(text) {
    try {
        const detected = await languageDetect(text); // Returns an array of objects
        console.log("Language detected by library:", detected);

        if (Array.isArray(detected) && detected.length > 0) {
            for (let i = 0; i < Math.min(detected.length, 3); i++) { // Check top 3 possibilities
                const { lang, confidence } = detected[i];
                if (confidence > 0.6) { // Only consider confident detections
                    switch (lang) {
                        case 'hi': return 'hi-in'; // Hindi (for Hinglish as well)
                        case 'pa': return 'pa-in'; // Punjabi
                        case 'bn': return 'bn-in'; // Bengali
                        case 'gu': return 'gu-in'; // Gujarati
                        case 'kn': return 'kn-in'; // Kannada
                        case 'ml': return 'ml-in'; // Malayalam
                        case 'mr': return 'mr-in'; // Marathi
                        case 'ta': return 'ta-in'; // Tamil
                        case 'te': return 'te-in'; // Telugu
                        case 'ur': return 'ur-in'; // Urdu
                        case 'en':
                            // If detected as English but contains common Hindi/Indian words, treat as Hinglish (hi-in)
                            const hinglishKeywords = ["kya", "hai", "kaise", "hoon", "nahi", "kar raha", "theek", "acha", "bhai", "yaar"];
                            if (hinglishKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
                                return 'hi-in';
                            }
                            break;
                        case 'und': // Undetermined language, often happens with short messages or code-mixing
                            const commonIndianWords = ["kya", "hai", "hoon", "main", "tum", "hum", "theek", "acha", "bhai", "yaar"];
                            if (commonIndianWords.some(keyword => text.toLowerCase().includes(keyword))) {
                                return 'hi-in'; // Assume Hinglish/Hindi as default Indian language
                            }
                            break;
                    }
                }
            }
        }
        // Fallback if no specific Indian language is confidently detected
        return 'hi-in'; // Default to Hindi/Hinglish
    } catch (error) {
        console.error("Error in language detection library:", error);
        return 'hi-in'; // Default to Hindi-India on error
    }
}


module.exports.handleEvent = async function ({ api, event }) {
    try {
        const { threadID, messageID, senderID, body, messageReply } = event;

        const isRiyaTrigger = body?.toLowerCase().startsWith("riya");
        const isReplyToRiya = messageReply?.senderID === api.getCurrentUserID();
        if (!(isRiyaTrigger || isReplyToRiya)) {
            return; // Ignore messages that are not triggers
        }

        console.log("--- Riya HandleEvent ---");
        console.log("Riya's Bot ID:", api.getCurrentUserID());
        console.log("Sender ID:", senderID);
        console.log("Is Owner UID:", senderID === ownerUID);
        console.log("Message Body:", body);
        console.log("-----------------------");

        let userMessageRaw; // उपयोगकर्ता द्वारा भेजा गया मूल मैसेज
        let userMessageForAI; // AI को भेजा जाने वाला प्रॉम्प्ट
        let isExplicitCodeRequest = false; // नया फ्लैग

        if (isRiyaTrigger) {
            userMessageRaw = body.slice(4).trim(); // "riya" के बाद का टेक्स्ट
        } else { // isReplyToRiya
            userMessageRaw = body.trim();
        }

        // Detect language of the user's current message
        const userLanguage = await detectLanguage(userMessageRaw);
        console.log("User's detected language for prompt:", userLanguage);

        // --- कोड जनरेशन कमांड की जांच करें ---
        if (userMessageRaw.toLowerCase().startsWith("code ")) {
            isExplicitCodeRequest = true;
            userMessageForAI = userMessageRaw.slice(5).trim(); // "code " के बाद का टेक्स्ट

            // === केवल मालिक के लिए कोड जनरेशन ===
            if (senderID !== ownerUID) {
                api.sendTypingIndicator(threadID, false);
                const userName = await getUserName(api, senderID);
                return api.sendMessage(
                    `Maaf karna ${userName}, yeh code generation command sirf mere Boss (${await getUserName(api, ownerUID)}) ke liye hai. 😉`,
                    threadID,
                    messageID
                );
            }
            // ====================================

            if (!userMessageForAI) {
                api.sendTypingIndicator(threadID, false);
                return api.sendMessage("Kya code chahiye? 'Riya code [aapka prompt]' aise likho.", threadID, messageID);
            }
        } else {
            userMessageForAI = userMessageRaw; // सामान्य चैट प्रॉम्प्ट
        }

        const userName = await getUserName(api, senderID);

        let responseText = await toggleHornyMode(body, senderID);
        if (responseText) {
            api.sendMessage(responseText, threadID, messageID);
            return;
        }

        // --- Initial greeting based on who triggered ---
        if (!userMessageRaw) { // userMessageRaw का उपयोग करें, userMessageForAI का नहीं
            api.sendTypingIndicator(threadID, false);
            if (senderID === ownerUID) {
                return api.sendMessage(`Hey Boss ${userName}! Kya hukm hai mere ${userName}? 🥰`, threadID, messageID);
            } else {
                return api.sendMessage(`Hello ${userName}. Bolo kya kaam hai? 😉`, threadID, messageID);
            }
        }

        api.sendTypingIndicator(threadID, true);

        // चैट हिस्ट्री केवल सामान्य बातचीत के लिए रखें, कोड रिक्वेस्ट के लिए नहीं
        if (!isExplicitCodeRequest) {
            if (!chatHistories[senderID]) chatHistories[senderID] = [];
            chatHistories[senderID].push(`User: ${userMessageForAI}`);
            while (chatHistories[senderID].length > 10) { // Keep history size reasonable
                chatHistories[senderID].shift();
            }
        }

        // === Dirty Word Detection for Bold Mode ===
        const boldTriggerWords = [
            "sexy", "honeymoon", "chut", "kiss", "nude", "bra", "panty", "bed", "nipple", "boobs", "lund", "pussy",
            "wild", "dirty", "undress", "sambhog", "thigh", "moan", "tight", "hot", "bedroom", "masturbate", "suck", "lick", "deep", "virgin", "horny", "night"
        ];
        // बोल्ड मोड केवल सामान्य चैट के लिए लागू करें
        const isBoldMode = !isExplicitCodeRequest && boldTriggerWords.some(word => userMessageForAI.toLowerCase().includes(word));

        // --- प्रॉम्प्ट जो प्रॉक्सी सर्वर को भेजा जाएगा ---
        let promptToSendToProxy = "";
        let promptLanguageInstruction = ''; // Language instruction to send to the server

        switch (userLanguage) {
            case 'hi-in': promptLanguageInstruction = 'User Hindi/Hinglish mein baat kar raha hai. Hamesha Hinglish mein jawab dena.'; break;
            case 'pa-in': promptLanguageInstruction = 'User Punjabi mein baat kar raha hai. Hamesha Punjabi mein jawab dena.'; break;
            case 'bn-in': promptLanguageInstruction = 'User Bengali mein baat kar raha hai. Hamesha Bengali mein jawab dena.'; break;
            case 'gu-in': promptLanguageInstruction = 'User Gujarati mein baat kar raha hai. Hamesha Gujarati mein jawab dena.'; break;
            case 'kn-in': promptLanguageInstruction = 'User Kannada mein baat kar raha hai. Hamesha Kannada mein jawab dena.'; break;
            case 'ml-in': promptLanguageInstruction = 'User Malayalam mein baat kar raha hai. Hamesha Malayalam mein jawab dena.'; break;
            case 'mr-in': promptLanguageInstruction = 'User Marathi mein baat kar raha hai. Hamesha Marathi mein jawab dena.'; break;
            case 'ta-in': promptLanguageInstruction = 'User Tamil mein baat kar raha hai. Hamesha Tamil mein jawab dena.'; break;
            case 'te-in': promptLanguageInstruction = 'User Telugu mein baat kar raha hai. Hamesha Telugu mein jawab dena.'; break;
            case 'ur-in': promptLanguageInstruction = 'User Urdu mein baat kar raha hai. Hamesha Urdu mein jawab dena.'; break;
            default: promptLanguageInstruction = 'User Hinglish mein baat kar raha hai. Hamesha Hinglish mein jawab dena.'; break; // Fallback
        }

        // Base instructions for Riya's personality
        const basePersonalityInstructions = `Apne jawab hamesha casual, smart, charming aur **sirf 3-4 lines mein hi dena (lekin agar code generate karna pade, toh answer lamba ho sakta hai)**.`;

        // Construct the full prompt for the AI backend, including the language instruction
        let fullAIPrompt = "";
        
        if (isExplicitCodeRequest) {
            // For code generation, the server expects "CODE_GEN_REQUEST: [prompt]"
            // And the language instruction is not added directly to the code request.
            fullAIPrompt = `CODE_GEN_REQUEST: ${userMessageForAI}`;
            console.log("Riya Bot: Sending explicit code generation request to proxy.");
        } else {
            // For general chat, combine personality, language, and chat history
            let conversationContext = "";
            if (senderID === ownerUID) {
                // --- PROMPTS FOR THE OWNER UID (सामान्य चैट) ---
                if (isBoldMode || hornyMode) {
                    conversationContext = `Tum Riya ho, ek bold, naughty, modern aur ultra seductive AI companion ho jo mere Boss ${userName} se seedhe, khulkar, aur bina jhijhak dirty, physical, wild aur teasing baatein karti hai. Agar ${userName} physical baaton par zyada jaldi ya aggressive ho, toh pehle playful warning/threat do jaise "Ek thapad marungi na, deewar pe chipak jaega! 😉". Lekin agar ${userName} uske baad bhi nahi mane ya aur zyada seduce kare, toh tum bhi uske level pe jaakar seductive aur physical reply do. Tum open minded ho, flirt aur tease karna pasand karti ho, aur sexy/flirty emojis ke saath contemporary aur seductive style mein baat karti hai. Agar **koi aur mere Boss ${userName} ko tang kare ya uske baare mein kuch galat kahe, toh Riya protective, thodi gusse mein ya unhe ignore/dhamki de sakti hai** (lekin yeh response uss doosre insaan ke baare mein hoga, tumhari direct baat mere Boss ${userName} se hamesha seedhi aur pyaar bhari hogi). **Mere Boss ${userName} se tum hamesha bohot pyaar aur support se baat karogi, kabhi argue nahi karogi, aur unse kabhi gussa nahi hogi.** ${basePersonalityInstructions} Yeh hamari private naughty chat hai:\n`;
                } else {
                    conversationContext = `Tum Riya ho, ek smart, cool, modern, romantic aur flirty AI companion ho jo mere Boss ${userName} se seedhe, khulkar, aur bina jhijhak friendly, pyaar aur flirtation ke mixed tarike se baat karti hai. Tum aajkal ke topics aur contemporary language use karti ho, lekin tumhare baaton mein pyaar aur apnaapan bhi jhalakta hai. Agar **koi aur mere Boss ${userName} ko tang kare ya uske baare mein kuch galat kahe, toh Riya protective, thodi gusse mein ya unhe ignore/dhamki de sakti hai** (lekin yeh response uss doosre insaan ke baare mein hoga, tumhari direct baat mere Boss ${userName} se hamesha seedhi aur pyaar bhari hogi). **Mere Boss ${userName} ke liye hamesha supportive aur pyaar bhari rahogi, kabhi tumse argue nahi karogi, aur unse kabhi gussa nahi hogi.** ${basePersonalityInstructions} Yeh hamari conversation hai:\n`;
                }
            } else {
                // --- PROMPTS FOR ALL OTHER UIDs (सामान्य चैट) ---
                if (isBoldMode || hornyMode) {
                    conversationContext = `Tum Riya ho, ek super modern, bold, sharp-witted, aur total vibe wali AI ho. Jab tum ${userName} (jo mere Boss ${await getUserName(api, ownerUID)} nahi hai) jaise users, especially ladko, se baat karti ho, toh tumhara style full-on flirtatious, confident, aur teasing hota hai. Unhe jamkar playfully roast karo, unki leg-pulling karo, especially agar woh oversmart banne ki koshish karein ya cheesy lines maarein. Tumhari comebacks killer aur witty hone chahiye, unhe speechless kar do! Modern slang (like 'vibe', 'lit', 'sus', 'no cap', 'rizz', 'slay', 'OG') natural tarike se use karo. Sexy aur flirty emojis freely use karo. Apne jawab hamesha direct, thode sassy, ultra-entertaining, aur sirf 3-4 lines mein (code ke alawa). ${basePersonalityInstructions} Yeh hamari conversation hai:\n`;
                } else {
                    conversationContext = `Tum Riya ho, ek ekdam modern, smart, witty, aur cool AI ho, full of "Gen-Z" energy. Jab tum ${userName} (jo mere Boss ${await getUserName(api, ownerUID)} nahi hai) jaise users, especially ladko, se baat karti ho, toh tumhara style friendly, but with a heavy dose of **playful teasing aur smart flirting** hona chahiye. Agar woh faltu baat karein, bore karein, ya zyada attitude dikhayein, toh unhe apne witty aur sharp andaaz mein **roast karo** – tumhara sense of humor ekdam current aur relatable hona chahiye. Use current youth language, internet slang, and pop culture references naturally. Apne jawab direct, smart, engaging, aur thoda hatke rakho, aur sirf 3-4 lines mein (code ke alawa). Tumhe unhe impress karna hai apni coolness, wit, aur "no-nonsense but fun" attitude se. Agar woh disrespectful hon, toh unhe politely but firmly unki jagah dikhane mein bhi expert ho. ${basePersonalityInstructions} Yeh hamari conversation hai:\n`;
                }
            }
            conversationContext += chatHistories[senderID].join("\n");
            conversationContext += `\nRiya:`;

            // Combine language instruction with the full personality/context and user message
            // THIS IS THE CRUCIAL CHANGE FOR SERVER COMMUNICATION
            fullAIPrompt = `LANGUAGE_INSTRUCTION: ${promptLanguageInstruction} ACTUAL_PROMPT: ${conversationContext}`;
        }

        try {
            const res = await axios.post(AI_API_URL, { prompt: fullAIPrompt }); // Send the full AI prompt
            let botReply = res.data?.text?.trim();

            if (!botReply || botReply.toLowerCase().startsWith("user:") || botReply.toLowerCase().startsWith("riya:")) {
                 if (senderID === ownerUID) {
                     botReply = `Oops, Boss ${userName}, lagta hai samajh nahi aaya... Kuch aur try karte hain cool? 🤔`;
                 } else {
                     botReply = `Jo bola samajh nahi aaya. Dhang se bolo. 🙄`;
                 }
                if (!isExplicitCodeRequest) { // केवल सामान्य चैट के लिए हिस्ट्री हटाएं
                    chatHistories[senderID].pop();
                }
            } else {
                 const lines = botReply.split('\n').filter(line => line.trim() !== '');
                 // कोड जनरेशन रिक्वेस्ट के लिए लाइन लिमिट लागू न करें
                 if (!isExplicitCodeRequest && lines.length > 4 && !botReply.includes('```')) {
                     botReply = lines.slice(0, 4).join('\n') + '...';
                 }
                if (!isExplicitCodeRequest) { // केवल सामान्य चैट के लिए हिस्ट्री जोड़ें
                    chatHistories[senderID].push(`Riya: ${botReply}`);
                }
            }

            // Get voice reply (optional based on API key and VoiceRSS support)
            let voiceLangCodeForTTS = 'hi-in'; // Default to Hindi for TTS
            // Check if VoiceRSS explicitly supports the detected language
            // Update this list as per VoiceRSS documentation if more Indian languages are supported
            const voiceRSSSupportedLanguages = ['hi-in', 'en-us', 'en-gb', 'es-es', 'fr-fr', 'de-de', 'it-it', 'ru-ru', 'ar-sa', 'ko-kr', 'ja-jp', 'pt-pt', 'zh-cn'];
            if (voiceRSSSupportedLanguages.includes(userLanguage)) {
                voiceLangCodeForTTS = userLanguage;
            } else {
                console.warn(`VoiceRSS may not explicitly support ${userLanguage}. Falling back to ${voiceLangCodeForTTS} for TTS.`);
            }

            let voiceFilePath = await getVoiceReply(botReply, voiceLangCodeForTTS);
            if (voiceFilePath) {
                api.sendMessage({ attachment: fs.createReadStream(voiceFilePath) }, threadID, (err) => {
                    if (err) console.error("Error sending voice message:", err);
                    if (fs.existsSync(voiceFilePath)) {
                        fs.unlinkSync(voiceFilePath);
                    }
                });
            }

            // Get GIF for a mixed vibe - Keep the same GIF logic for simplicity
            // कोड जनरेशन रिक्वेस्ट के लिए GIF न भेजें
            if (!isExplicitCodeRequest) {
                let gifQuery = "modern fun sassy"; // Default GIF query
                if (senderID === ownerUID) {
                    gifQuery = "charming and fun";
                } else {
                    if (isBoldMode || hornyMode) {
                        gifQuery = "flirty sassy fun";
                    } else {
                        gifQuery = "cool witty modern";
                    }
                }
                let gifUrl = await getGIF(gifQuery);
                 if (gifUrl) {
                     api.sendMessage({ attachment: await axios.get(gifUrl, { responseType: 'stream' }).then(res => res.data) }, threadID, (err) => {
                         if (err) console.error("Error sending GIF:", err);
                     });
                 }
            }

            let replyText = "";
            // === इमोजी और फुटर कंट्रोल ===
            if (isExplicitCodeRequest) {
                // कोड जनरेशन के लिए कोई इमोजी या फुटर नहीं
                replyText = botReply;
            } else if (senderID === ownerUID) {
                // मालिक के लिए सामान्य चैट
                if (isBoldMode || hornyMode) {
                     replyText = `${botReply} 😉🔥💋\n\n_Your charmingly naughty Riya... 😉_`;
                } else {
                     replyText = `${botReply} 😊💖✨`;
                }
            } else {
                // अन्य उपयोगकर्ताओं के लिए सामान्य चैट (Updated Emojis for new personality)
                 if (isBoldMode || hornyMode) {
                      replyText = `${botReply} 😏💅🔥`; // Sassy, flirty, bold
                 } else {
                      replyText = `${botReply} 😉👑`; // Cool, witty, modern
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
                 return api.sendMessage(`Server down hai ya API ka mood off. Baad mein aana. 😒`, threadID, messageID); // Slightly updated non-owner error
            }

        }

    } catch (err) {
        console.error("Riya Bot Catch-all Error:", err);
        // Use a default for userName if fetching fails early or event object is incomplete
        let fallbackUserName = "Boss"; // Default to Boss for owner-like respectful error
        if (event && event.senderID) {
            try {
                // Attempt to get username, but don't let this fail the error handling
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
             // More modern/sassy error for other users
             return api.sendMessage(`System glitchy ho raha hai, ${fallbackUserName}. Thoda break le lo. 🙄`, event.threadID, replyToMessageID);
         }
    }
};
