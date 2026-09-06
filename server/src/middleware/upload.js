const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getBasePath } = require("../config/paths");

const allowedMimeTypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(getBasePath(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`,
    );
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isExcelMime = allowedMimeTypes.includes(file.mimetype);
  const isExcelExt = ext === ".xls" || ext === ".xlsx";

  if (isExcelMime && isExcelExt) {
    cb(null, true);
    return;
  }

  cb(new Error("مسموح فقط ملفات Excel (.xls, .xlsx)"), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});
