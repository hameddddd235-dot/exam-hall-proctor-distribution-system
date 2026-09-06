const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const upload = require("../middleware/upload");
const { generatePDFWithPuppeteer } = require("../generators/pdfGenerators");
const { generateAllCollegePDFs } = require("../helpers/collegeHelper");
const { buildHallView } = require("../views/viewBuilders");
const { getArabicDayFromDate } = require("../utils/dateUtils");
const { getBasePath } = require("../config/paths");
const { validateConvertWorkbook } = require("../validation/workbookValidation");
const { AppError } = require("../errors/appError");

router.post("/upload-monitors-only", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ملف Excel مطلوب" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new AppError("الملف المحدّث لا يحتوي على أي شيت.");
    }

    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
    validateConvertWorkbook(rawData);

    const monitorsMap = {};
    rawData.forEach((row) => {
      const name = row["المراقب"];
      if (!name) return;

      if (!monitorsMap[name]) {
        monitorsMap[name] = {
          name,
          degree: row["الدرجة"] || "",
          college: row["الكلية"] || "",
          assignments: [],
        };
      }

      monitorsMap[name].assignments.push({
        date: row["التاريخ"] || "",
        period: row["الفترة"] || "",
        type:
          row["النوع"] === "أساسي" || row["النوع"] === "main"
            ? "main"
            : "reserve",
        room: row["القاعة"] || "",
      });
    });

    const monitorsView = Object.values(monitorsMap);

    const periodMap = new Map();
    monitorsView.forEach((monitor) => {
      monitor.assignments.forEach((assignment) => {
        if (assignment.type !== "main" || !assignment.room) return;

        const key = `${assignment.date}_${assignment.period}_${assignment.room}`;
        if (!periodMap.has(key)) {
          periodMap.set(key, {
            date: assignment.date,
            day: getArabicDayFromDate(assignment.date),
            period: assignment.period,
            room: assignment.room,
            mainMonitors: [],
            reserveMonitors: [],
          });
        }

        periodMap.get(key).mainMonitors.push({ name: monitor.name });
      });
    });

    const allMonitors = monitorsView.map((monitor) => ({
      name: monitor.name,
      degree: monitor.degree,
      college: monitor.college,
    }));
    buildHallView(Array.from(periodMap.values()), allMonitors);

    const basePath = getBasePath();
    const pdfsDir = path.join(basePath, "output", "pdfs");
    const collegesDir = path.join(basePath, "output", "colleges");
    if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });
    if (!fs.existsSync(collegesDir)) fs.mkdirSync(collegesDir, { recursive: true });

    const timestamp = Date.now();
    const outputFile = path.join(pdfsDir, `monitors-from-excel-${timestamp}.pdf`);
    await generatePDFWithPuppeteer(monitorsView, outputFile);

    const collegePdfs = await generateAllCollegePDFs(
      monitorsView,
      collegesDir,
      timestamp,
    );

    res.json({
      message: "تم توليد ملفات PDF بنجاح",
      monitorsPdf: `/output/pdfs/${path.basename(outputFile)}`,
      collegePdfs,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في الخادم",
      error: err.message,
    });
  }
});

module.exports = router;
