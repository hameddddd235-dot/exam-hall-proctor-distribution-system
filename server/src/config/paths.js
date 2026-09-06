const path = require("path");

// __dirname = server/src/config
// الجذر = EXAM-MO/ (3 مستويات للأعلى)

function getBasePath() {
  if (process.pkg) return path.dirname(process.execPath);
  return path.join(__dirname, "../../..");
}

function getAssetPath(...paths) {
  if (process.pkg) {
    // في pkg: الملفات المضمنة في snapshot
    // __dirname داخل snapshot = server/src/config
    // نطلع 3 مستويات للوصول لجذر الـ snapshot (EXAM-MO)
    return path.join(__dirname, "../../..", ...paths);
  }
  // في الوضع العادي
  return path.join(__dirname, "../../..", ...paths);
}

module.exports = { getBasePath, getAssetPath };
