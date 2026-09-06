const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/upload");
const { getOrProcessFromStore } = require("../helpers/processData");
const {
  generatePDFWithPuppeteer,
  generatePDFFromHalls,
} = require("../generators/pdfGenerators");
const { generateAllCollegePDFs } = require("../helpers/collegeHelper");
const { getBasePath } = require("../config/paths");

const THREE_FILES = upload.fields([
  { name: "monitorsFile", maxCount: 1 },
  { name: "periodsFile", maxCount: 1 },
  { name: "hallsCapacityFile", maxCount: 1 },
]);

function ensureDirectories(...dirs) {
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function outputDirs() {
  const basePath = getBasePath();
  const pdfs = path.join(basePath, "output", "pdfs");
  const colleges = path.join(basePath, "output", "colleges");
  ensureDirectories(pdfs, colleges);
  return { pdfs, colleges };
}

router.post("/generate-pdf", THREE_FILES, async (req, res) => {
  try {
    const data = getOrProcessFromStore(req);
    if (!data) {
      return res.status(400).json({
        message: "يرجى رفع الملفات الثلاثة: المراقبين، الفترات، وسعة القاعات.",
      });
    }

    const { pdfs, colleges } = outputDirs();
    const timestamp = Date.now();
    const monitorsOut = path.join(pdfs, `distribution-${timestamp}.pdf`);
    const hallsOut = path.join(pdfs, `halls-${timestamp}.pdf`);

    await generatePDFWithPuppeteer(data.monitorsView, monitorsOut);
    await generatePDFFromHalls(data.hallsView, hallsOut);
    const collegePdfs = await generateAllCollegePDFs(
      data.monitorsView,
      colleges,
      timestamp,
    );

    res.json({
      message: "تم توليد ملفات PDF بنجاح",
      monitorsPdf: `/output/pdfs/${path.basename(monitorsOut)}`,
      hallsPdf: `/output/pdfs/${path.basename(hallsOut)}`,
      collegePdfs,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في توليد PDF",
      error: err.message,
    });
  }
});

router.get("/download-pdf", async (req, res) => {
  try {
    const data = getOrProcessFromStore(req);
    if (!data) {
      return res.status(400).json({ message: "لا توجد بيانات. يرجى رفع الملفات أولًا." });
    }

    const { pdfs } = outputDirs();
    const outputFile = path.join(pdfs, `all-monitors-${Date.now()}.pdf`);
    await generatePDFWithPuppeteer(data.monitorsView, outputFile);

    res.json({
      message: "تم توليد PDF",
      pdfFile: `/output/pdfs/${path.basename(outputFile)}`,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في توليد PDF",
    });
  }
});

router.get("/download-halls-pdf", async (req, res) => {
  try {
    const data = getOrProcessFromStore(req);
    if (!data) {
      return res.status(400).json({ message: "لا توجد بيانات. يرجى رفع الملفات أولًا." });
    }

    const { pdfs } = outputDirs();
    const outputFile = path.join(pdfs, `halls-${Date.now()}.pdf`);
    await generatePDFFromHalls(data.hallsView, outputFile);

    res.json({
      message: "تم توليد PDF القاعات",
      pdfFile: `/output/pdfs/${path.basename(outputFile)}`,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في توليد PDF القاعات",
    });
  }
});

router.get("/download-pdfs-by-college", async (req, res) => {
  try {
    const data = getOrProcessFromStore(req);
    if (!data) {
      return res.status(400).json({ message: "لا توجد بيانات. يرجى رفع الملفات أولًا." });
    }

    const { colleges } = outputDirs();
    const files = await generateAllCollegePDFs(
      data.monitorsView,
      colleges,
      Date.now(),
    );

    res.json({
      message: `تم توليد ${files.length} ملف PDF`,
      files,
      totalColleges: files.length,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في توليد PDFs الكليات",
      error: err.message,
    });
  }
});

module.exports = router;
