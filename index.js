require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const Groq = require("groq-sdk");

// Check if Key exists
if (!process.env.GROQ_API_KEY) {
    console.error("❌ ERROR: GROQ_API_KEY is missing in Railway Variables!");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const BOYFRIEND_NUMBER = process.env.BOYFRIEND_NUMBER + "@c.us";
const BOYFRIEND_NAME = process.env.BOYFRIEND_NAME;

const client = new Client({
  authStrategy: new LocalAuth(), 
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    protocolTimeout: 60000, // 60 seconds (Fails fast if stuck)
    timeout: 60000,         // 60 seconds
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox", 
      "--disable-dev-shm-usage", 
      "--disable-gpu", 
      "--no-first-run",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=site-per-process" 
    ]
  }
});

client.on("qr", (qr) => {
  console.log("🚨 QR CODE GENERATED - Check instructions in previous chat to scan!");
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

const messageStyles = [
  "a short sweet loving message in English",
  "a tender loving message in Hindi (use Hindi script)",
  "a sweet message in Marathi (use Marathi script)",
  "a mix of Hindi and English (Hinglish) love message",
  "a playful and cute love message in English",
  "a deeply emotional and heartfelt message in English",
  "a funny love poem",
  "a funny and playful love message"
];

function getRandomStyle() {
  return messageStyles[Math.floor(Math.random() * messageStyles.length)];
}

async function generateMessage(prompt) {
  try {
    console.log("🤖 Asking Groq to write the message...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    console.log("🧠 Groq successfully wrote the message!");
    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error("❌ Groq Generation Error:", err.message);
    return "Thinking of you and smiling! 💕";
  }
}

function scheduleMessages() {
  const nicknames = "navraa, cutuu, tannu, kuchhi, or baby";

  // 🌅 7:00 AM IST Schedule
  cron.schedule("0 7 * * *", async () => {
    console.log("🚀 TRIGGERED: Morning Message Process Starting...");
    const prompt = `Write ${getRandomStyle()} as a good morning message for my boyfriend ${BOYFRIEND_NAME}. You MUST address him using one of these affectionate nicknames: ${nicknames}. Keep it short (2-4 lines), loving, and use max 2 emojis. Do not use generic openers. Return only the message text.`;
    const msg = await generateMessage(prompt);
    try {
      console.log("📱 Sending message to WhatsApp...");
      await client.sendMessage(BOYFRIEND_NUMBER, msg);
      console.log("✅ SUCCESS: Morning message sent!\n", msg);
    } catch (err) {
      console.error("❌ FAILED to send via WhatsApp. Forcing restart...", err);
      process.exit(1); // Force Railway to cleanly reboot the container
    }
  }, { timezone: "Asia/Kolkata" });

  // 🌙 12:00 AM IST Schedule
  cron.schedule("0 0 * * *", async () => {
    console.log("🚀 TRIGGERED: Night Message Process Starting...");
    const prompt = `Write ${getRandomStyle()} as a good night message for my boyfriend ${BOYFRIEND_NAME}. You MUST address him using one of these affectionate nicknames: ${nicknames}. Keep it short (2-4 lines), sweet, and use max 2 emojis. Return only the message text.`;
    const msg = await generateMessage(prompt);
    try {
      console.log("📱 Sending message to WhatsApp...");
      await client.sendMessage(BOYFRIEND_NUMBER, msg);
      console.log("✅ SUCCESS: Night message sent!\n", msg);
    } catch (err) {
      console.error("❌ FAILED to send via WhatsApp. Forcing restart...", err);
      process.exit(1);
    }
  }, { timezone: "Asia/Kolkata" });

  // 🧪 TEST SCHEDULE: Change the numbers below to exactly 2 mins from your current time!
  // Format is: "Minute Hour * * *"
  cron.schedule("13 11 * * *", async () => {
    console.log("🚀 TRIGGERED: Test Process Starting...");
    const prompt = `Write ${getRandomStyle()} as a funny love message for my boyfriend ${BOYFRIEND_NAME}. You MUST address him using one of these affectionate nicknames: ${nicknames}. Keep it short (2-4 lines), sweet, and use max 2 emojis. Return only the message text.`;
    const msg = await generateMessage(prompt);
    try {
      console.log("📱 Sending message to WhatsApp...");
      await client.sendMessage(BOYFRIEND_NUMBER, msg);
      console.log("✅ SUCCESS: Test message sent!\n", msg);
    } catch (err) {
      console.error("❌ FAILED to send via WhatsApp. Forcing restart...", err);
      process.exit(1);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("📅 Scheduled: Good morning, Good night, and Test loaded!");
}

client.initialize();