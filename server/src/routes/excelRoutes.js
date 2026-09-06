const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const upload = require("../middleware/upload");
const { getOrProcessFromStore } = require("../helpers/processData");
const { buildExcelRows } = require("../helpers/excelBuilder");
const { getBasePath } = require("../config/paths");

const THREE_FILES = upload.fields([
  { name: "monitorsFile", maxCount: 1 },
  { name: "periodsFile", maxCount: 1 },
  { name: "hallsCapacityFile", maxCount: 1 },
]);

router.post("/generate-excel", THREE_FILES, async (req, res) => {
  try {
    const data = getOrProcessFromStore(req);
    if (!data) {
      return res
        .status(400)
        .json({ message: "يرجى رفع الملفات أولًا عبر /api/upload-all" });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(buildExcelRows(data.monitorsView));
    XLSX.utils.book_append_sheet(workbook, worksheet, "Distribution");

    const outputDir = path.join(getBasePath(), "output", "excel");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, `distribution-${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, outputFile);

    res.json({
      message: "تم توليد Excel",
      excelFile: `/output/excel/${path.basename(outputFile)}`,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في توليد Excel",
      error: err.message,
    });
  }
});

module.exports = router;
