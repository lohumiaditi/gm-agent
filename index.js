require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Restore session from environment variable if present
if (process.env.SESSION_DATA) {
  console.log("📦 Restoring session from environment variable...");
  try {
    const sessionPath = ".wwebjs_auth/session";
    fs.mkdirSync(sessionPath, { recursive: true });
    function writeDirRecursive(dir, data) {
      for (const [key, value] of Object.entries(data)) {
        const fullPath = path.join(dir, key);
        if (typeof value === "object" && !Array.isArray(value)) {
          fs.mkdirSync(fullPath, { recursive: true });
          writeDirRecursive(fullPath, value);
        } else {
          fs.writeFileSync(fullPath, Buffer.from(value, "base64"));
        }
      }
    }
    const sessionData = JSON.parse(
      Buffer.from(process.env.SESSION_DATA, "base64").toString()
    );
    writeDirRecursive(sessionPath, sessionData);
    console.log("✅ Session restored successfully!");
  } catch (err) {
    console.error("❌ Failed to restore session:", err);
  }
}

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  console.log("📱 Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
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
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", month: "long", day: "numeric"
  });
  const style = getRandomStyle();
  const prompt = `Write ${style} as a good morning message for my boyfriend named ${BOYFRIEND_NAME}.
Today is ${today}.
Rules:
- Keep it short (2-4 lines or sentences max)
- Make it feel genuine, warm and personal — not like a template
- Use 1-2 tasteful emojis at most
- Do NOT use generic openers like "May your day be..." or "Wishing you..."
- Only return the message itself, nothing else`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateGoodNightMessage() {
  const style = getRandomStyle();
  const prompt = `Write ${style} as a good night message for my boyfriend named ${BOYFRIEND_NAME}.
Rules:
- Keep it short (2-4 lines or sentences max)
- Make it feel tender, intimate and genuine — not like a template
- Use 1-2 tasteful emojis at most
- Do NOT use generic lines like "Sweet dreams" alone or "Have a good rest"
- Make it feel like it's coming from someone deeply in love
- Only return the message itself, nothing else`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function scheduleMessages() {
  cron.schedule("0 7 * * *", async () => {
    console.log("🌅 Sending good morning message...");
    try {
      const message = await generateGoodMorningMessage();
      await client.sendMessage(BOYFRIEND_NUMBER, message);
      console.log("✅ Good morning sent:\n", message);
    } catch (err) {
      console.error("❌ Error sending good morning:", err);
    }
  }, { timezone: "Asia/Kolkata" });

  cron.schedule("0 0 * * *", async () => {
    console.log("🌙 Sending good night message...");
    try {
      const message = await generateGoodNightMessage();
      await client.sendMessage(BOYFRIEND_NUMBER, message);
      console.log("✅ Good night sent:\n", message);
    } catch (err) {
      console.error("❌ Error sending good night:", err);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("📅 Scheduled: Good morning at 7AM & Good night at 12AM IST");
}

client.initialize();