const fs = require("fs");
const path = require("path");

const sessionPath = ".wwebjs_auth/session";

if (!fs.existsSync(sessionPath)) {
  console.log("❌ No session found at", sessionPath);
  process.exit(1);
}

// Only backup these essential folders/files — skip Chrome cache
const ALLOWED_FOLDERS = [
  "Default/Local Storage",
  "Default/Session Storage",
  "Default/shared_proto_db",
];

const ESSENTIAL_FILES = [
  "Local State",
  "Last Version",
];

function readDirRecursive(dir, relativePath = "") {
  const result = {};
  let items;
  try {
    items = fs.readdirSync(dir);
  } catch (e) {
    return result;
  }

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = relativePath ? `${relativePath}/${item}` : item;

    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // Only include allowed folders
        const isAllowed = ALLOWED_FOLDERS.some(f => 
          relPath === f || f.startsWith(relPath + "/") || relPath.startsWith(f)
        );
        if (isAllowed || relativePath === "") {
          const subResult = readDirRecursive(fullPath, relPath);
          if (Object.keys(subResult).length > 0) {
            result[item] = subResult;
          }
        }
      } else {
        // Only include essential files or files inside allowed folders
        const isEssential = ESSENTIAL_FILES.includes(relPath);
        const isInAllowedFolder = ALLOWED_FOLDERS.some(f => relPath.startsWith(f));
        
        if (isEssential || isInAllowedFolder) {
          // Skip files larger than 2MB
          if (stat.size > 500 * 1024) {
            console.log("⚠️ Skipping large file:", relPath, `(${(stat.size/1024/1024).toFixed(1)}MB)`);
            continue;
          }
          try {
            result[item] = fs.readFileSync(fullPath).toString("base64");
          } catch (e) {
            console.log("⚠️ Skipping locked file:", relPath);
          }
        }
      }
    } catch (e) {
      console.log("⚠️ Skipping:", relPath);
    }
  }
  return result;
}

const sessionData = readDirRecursive(sessionPath);
const encoded = Buffer.from(JSON.stringify(sessionData)).toString("base64");
fs.writeFileSync("session-backup.txt", encoded);

const sizeMB = (Buffer.byteLength(encoded) / 1024 / 1024).toFixed(2);
console.log(`✅ Session backed up to session-backup.txt (${sizeMB} MB)`);
console.log("📋 Copy the contents into Railway as SESSION_DATA variable");