require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const Groq = require("groq-sdk");

// Check if Keys exist
if (!process.env.GROQ_API_KEY || !process.env.SISTER_NUMBER) {
    console.error("❌ ERROR: Missing GROQ_API_KEY or SISTER_NUMBER in Railway Variables!");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Contacts
const BOYFRIEND_NUMBER = process.env.BOYFRIEND_NUMBER + "@c.us";
const BOYFRIEND_NAME = process.env.BOYFRIEND_NAME;
const SISTER_NUMBER = process.env.SISTER_NUMBER + "@c.us";
const SISTER_NAME = "Isha";

const client = new Client({
  authStrategy: new LocalAuth(), 
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    protocolTimeout: 60000, 
    timeout: 60000,         
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox", 
      "--disable-dev-shm-usage", 
      "--disable-gpu", 
      "--no-first-run",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=site-per-process",
      "--js-flags=--max-old-space-size=256", 
      "--disable-extensions"
    ]
  }
});

client.on("qr", (qr) => {
  console.log("🚨 QR CODE GENERATED - Check instructions to scan!");
});

client.on("ready", () => {
  console.log("✅ WhatsApp connected! Agent is ready to send.");
  scheduleMessages();

  // 💓 KEEP-ALIVE PING: Runs every 5 minutes to stay wide awake
  cron.schedule("*/5 * * * *", async () => {
    try {
      const state = await client.getState();
      console.log(`💓 Heartbeat ping... WhatsApp State: ${state}`);
    } catch(err) {
      console.log("⚠️ Heartbeat failed. Forcing container restart to recover...");
      process.exit(1); 
    }
  });
});

client.on("disconnected", (reason) => {
  console.log("❌ Disconnected:", reason);
  process.exit(1); 
});

// Styles for Boyfriend
const bfStyles = [
  "a funny love poem",
  "a funny and playful love message",
  "a mix of Hindi and English (Hinglish) playful message",
  "a witty and sweet observation about love"
];

// Styles for Sister
const sisterStyles = [
  "a sarcastic greeting",
  "a witty roast",
  "a funny dramatic monologue",
  "a playful insult wrapped in prose"
];

function getRandomStyle(stylesArray) {
  return stylesArray[Math.floor(Math.random() * stylesArray.length)];
}

// Universal AI Generator with Witty Persona
async function generateMessage(prompt) {
  try {
    console.log("🤖 Asking Groq to write the message...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a super intelligent, witty, and comic person who makes quips, writes prose, and makes jokes. Your tone is highly clever, humorous, and entertaining." 
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
    });
    console.log("🧠 Groq successfully wrote the message!");
    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error("❌ Groq Generation Error:", err.message);
    return "Thinking of you! 💕"; // Fallback
  }
}

function scheduleMessages() {
  const nicknames = "navraa, cutuu, tannu, kuchhi, or baby";

  // ---------------------------------------------------------
  // 🧪 TEST SCHEDULE: 11:40 AM IST for BOTH
  // ---------------------------------------------------------
  cron.schedule("40 11 * * *", async () => {
    console.log("🚀 TRIGGERED: 11:40 AM Multi-Test Process Starting...");

    // --- 1. BOYFRIEND TEST ---
    const bfPrompt = `Write ${getRandomStyle(bfStyles)} to say good morning to my boyfriend ${BOYFRIEND_NAME}. You MUST address him using one of these affectionate nicknames: ${nicknames}. Keep it short (2-4 lines), sweet but funny, and use max 2 emojis. Return only the message text.`;
    const bfMsg = await generateMessage(bfPrompt);
    
    try {
      console.log("📱 Sending message to Boyfriend...");
      await client.sendMessage(BOYFRIEND_NUMBER, bfMsg);
      console.log("✅ SUCCESS: Boyfriend test sent!\n", bfMsg);
    } catch (err) {
      console.error("❌ FAILED to send to Boyfriend.", err);
    }

    // Wait 10 seconds to avoid WhatsApp spam detection
    console.log("⏳ Waiting 10 seconds before texting sister...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // --- 2. SISTER TEST ---
    const sisterPrompt = `Write ${getRandomStyle(sisterStyles)} to my sister ${SISTER_NAME} to check in on her. Pull her leg and roast her heavily about having very little hair on her head and extremely chubby cheeks. Keep it short (2-4 lines), highly witty, comic, and teasing. Max 2 emojis. Return only the message text.`;
    const sisterMsg = await generateMessage(sisterPrompt);

    try {
      console.log("📱 Sending message to Sister...");
      await client.sendMessage(SISTER_NUMBER, sisterMsg);
      console.log("✅ SUCCESS: Sister test sent!\n", sisterMsg);
    } catch (err) {
      console.error("❌ FAILED to send to Sister.", err);
    }

  }, { timezone: "Asia/Kolkata" });

  // ---------------------------------------------------------
  // 🌅 REGULAR DAILY SCHEDULES
  // ---------------------------------------------------------
  // Boyfriend Morning (7:00 AM)
  cron.schedule("0 7 * * *", async () => {
    const prompt = `Write ${getRandomStyle(bfStyles)} as a good morning message for my boyfriend ${BOYFRIEND_NAME}. You MUST address him using one of these affectionate nicknames: ${nicknames}. Keep it short (2-4 lines), funny but loving, max 2 emojis. Return only the message text.`;
    const msg = await generateMessage(prompt);
    try { await client.sendMessage(BOYFRIEND_NUMBER, msg); } catch (err) { process.exit(1); }
  }, { timezone: "Asia/Kolkata" });

  // Sister Morning Roast (8:00 AM)
  cron.schedule("0 8 * * *", async () => {
    const prompt = `Write ${getRandomStyle(sisterStyles)} as a good morning message to my sister ${SISTER_NAME}. Pull her leg about her balding/thinning hair and massive chubby cheeks. Keep it short (2-4 lines), witty, and teasing. Max 2 emojis. Return only the message text.`;
    const msg = await generateMessage(prompt);
    try { await client.sendMessage(SISTER_NUMBER, msg); } catch (err) { process.exit(1); }
  }, { timezone: "Asia/Kolkata" });

  // Boyfriend Night (12:00 AM)
  cron.schedule("0 0 * * *", async () => {
    const prompt = `Write ${getRandomStyle(bfStyles)} as a good night message for my boyfriend ${BOYFRIEND_NAME}. You MUST address him using one of these affectionate nicknames: ${nicknames}. Keep it short (2-4 lines), sweet, max 2 emojis. Return only the message text.`;
    const msg = await generateMessage(prompt);
    try { await client.sendMessage(BOYFRIEND_NUMBER, msg); } catch (err) { process.exit(1); }
  }, { timezone: "Asia/Kolkata" });

  console.log("📅 Scheduled: Daily routines + 11:40 AM Multi-Test loaded!");
}

client.initialize();