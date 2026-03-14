require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BOYFRIEND_NUMBER = process.env.BOYFRIEND_NUMBER + "@c.us";
const BOYFRIEND_NAME = process.env.BOYFRIEND_NAME;

const client = new Client({
  authStrategy: new LocalAuth(), 
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run"
    ]
  }
});

client.on("qr", (qr) => {
  console.log("\n\n========================================================");
  console.log("🚨 NEW QR CODE GENERATED!");
  console.log("1. Go to this website: https://www.the-qrcode-generator.com/");
  console.log("2. Click the 'Text' option on the site.");
  console.log("3. Copy the weird text below and paste it into the site.");
  console.log("4. Scan the square it generates immediately! (You have 20 seconds)");
  console.log("========================================================");
  console.log(qr);
  console.log("========================================================\n\n");
});

client.on("ready", () => {
  console.log("✅ WhatsApp connected! Agent is running...");
  scheduleMessages();
});

client.on("disconnected", (reason) => {
  console.log("❌ Disconnected:", reason);
  process.exit(1);
});

const messageStyles = [
  "a short sweet loving message in English",
  "a tender loving message in Hindi (use Hindi script)",
  "a sweet message in Marathi (use Marathi script)",
  "a romantic short poem in English",
  "a romantic short poem in Hindi (use Hindi script)",
  "a mix of Hindi and English (Hinglish) love message",
  "a playful and cute love message in English",
  "a deeply emotional and heartfelt message in English",
  "a short Marathi poem",
  "a message using a beautiful metaphor about love"
];

function getRandomStyle() {
  return messageStyles[Math.floor(Math.random() * messageStyles.length)];
}

async function generateGoodMorningMessage() {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
  const prompt = `Write ${getRandomStyle()} as a good morning message for my boyfriend named ${BOYFRIEND_NAME}. Today is ${today}. Rules: Keep it short (2-4 lines), genuine, warm, max 2 emojis, no generic openers. Only return the message itself.`;
  
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });
  return chatCompletion.choices[0].message.content;
}

async function generateGoodNightMessage() {
  const prompt = `Write ${getRandomStyle()} as a good night message for my boyfriend named ${BOYFRIEND_NAME}. Rules: Keep it short (2-4 lines), tender, intimate, max 2 emojis, no generic lines. Only return the message itself.`;
  
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });
  return chatCompletion.choices[0].message.content;
}

function scheduleMessages() {
  // Morning Test 
  cron.schedule("30 2 * * *", async () => {
    console.log("🌅 Sending good morning message...");
    try {
      const msg = await generateGoodMorningMessage();
      await client.sendMessage(BOYFRIEND_NUMBER, msg);
      console.log("✅ Morning sent:\n", msg);
    } catch (err) { console.error("❌ Error:", err); }
  }, { timezone: "Asia/Kolkata" });

  // Night Test 
  cron.schedule("32 2 * * *", async () => {
    console.log("🌙 Sending good night message...");
    try {
      const msg = await generateGoodNightMessage();
      await client.sendMessage(BOYFRIEND_NUMBER, msg);
      console.log("✅ Night sent:\n", msg);
    } catch (err) { console.error("❌ Error:", err); }
  }, { timezone: "Asia/Kolkata" });

  console.log("📅 Scheduled: Good morning and Good night tests.");
}

client.initialize();