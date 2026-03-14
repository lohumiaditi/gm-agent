const fs = require("fs");
const path = require("path");

const sessionPath = ".wwebjs_auth/session";

if (!fs.existsSync(sessionPath)) {
  console.log("❌ No session found at", sessionPath);
  process.exit(1);
}

function readDirRecursive(dir) {
  const result = {};
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result[item] = readDirRecursive(fullPath);
    } else {
      try {
        result[item] = fs.readFileSync(fullPath).toString("base64");
      } catch (e) {
        result[item] = "";
      }
    }
  }
  return result;
}

const sessionData = readDirRecursive(sessionPath);
const encoded = Buffer.from(JSON.stringify(sessionData)).toString("base64");
fs.writeFileSync("session-backup.txt", encoded);
console.log("✅ Session backed up to session-backup.txt");
console.log("📋 Copy the contents of that file into Railway as SESSION_DATA variable");