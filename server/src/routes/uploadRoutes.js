const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { processFilesFromPaths } = require("../helpers/processData");
const dataStore = require("../data/dataStore");

const THREE_FILES = upload.fields([
  { name: "monitorsFile", maxCount: 1 },
  { name: "periodsFile", maxCount: 1 },
  { name: "hallsCapacityFile", maxCount: 1 },
]);

router.post("/upload-all", THREE_FILES, (req, res) => {
  try {
    const files = req.files;
    if (!files.monitorsFile || !files.periodsFile || !files.hallsCapacityFile) {
      return res.status(400).json({ message: "الملفات الثلاثة مطلوبة" });
    }

    processFilesFromPaths(
      files.monitorsFile[0].path,
      files.periodsFile[0].path,
      files.hallsCapacityFile[0].path,
    );

    res.json({
      message: "تم رفع الملفات بنجاح",
      counts: {
        monitors: dataStore.monitors.length,
        docAndMasters: dataStore.docAndMasters.length,
        normalmonitors: dataStore.normalmonitors.length,
        periods: dataStore.periods.length,
        halls: dataStore.halls.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "خطأ في معالجة الملفات",
    });
  }
});

module.exports = router;
