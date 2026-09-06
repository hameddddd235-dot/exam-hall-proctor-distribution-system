const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { getOrProcessFromStore } = require("../helpers/processData");
const { generatePDFWithPuppeteer } = require("../generators/pdfGenerators");
const { buildExcelRows } = require("../helpers/excelBuilder");
const { getBasePath } = require("../config/paths");

router.get("/run-distribution", async (req, res) => {
  try {
    const data = getOrProcessFromStore(req);
    if (!data) {
      return res.status(400).json({ message: "لا توجد بيانات. يرجى رفع الملفات أولًا." });
    }

    const basePath = getBasePath();
    const pdfsDir = path.join(basePath, "output", "pdfs");
    const excelDir = path.join(basePath, "output", "excel");
    if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });
    if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });

    const pdfOutput = path.join(pdfsDir, `distribution-${Date.now()}.pdf`);
    try {
      await generatePDFWithPuppeteer(data.monitorsView, pdfOutput);
    } catch (err) {
      console.error("PDF Error:", err);
      return res.status(500).json({ message: "خطأ في توليد PDF" });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(buildExcelRows(data.monitorsView)),
      "Distribution",
    );
    XLSX.writeFile(workbook, path.join(excelDir, "distribution.xlsx"));

    res.json({
      message: "اكتمل التوزيع",
      pdfFile: "/api/download-pdf",
      excelFile: "/api/download-excel",
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في التوزيع",
    });
  }
});

module.exports = router;
