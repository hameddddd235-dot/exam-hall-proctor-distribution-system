const path = require("path");
const { generatePDFForCollege } = require("../generators/pdfGenerators");

function groupByCollege(monitorsView) {
  const map = new Map();
  monitorsView.forEach((m) => {
    const college = m.college || "غير محدد";
    if (!map.has(college)) map.set(college, []);
    map.get(college).push(m);
  });
  return map;
}

async function generateAllCollegePDFs(monitorsView, collegesDir, timestamp) {
  const files = [];
  for (const [collegeName, monitors] of groupByCollege(monitorsView).entries()) {
    const safeName = collegeName.replace(/[<>:"/\\|?*]/g, "_").trim() || "غير_محدد";
    const pdfPath  = path.join(collegesDir, `${safeName}-${timestamp}.pdf`);
    try {
      await generatePDFForCollege(collegeName, monitors, pdfPath);
      files.push({
        college:  collegeName,
        fileName: `${safeName}-${timestamp}.pdf`,
        path:     `/output/colleges/${safeName}-${timestamp}.pdf`,
        count:    monitors.length,
      });
    } catch (err) {
      console.error(`❌ خطأ في PDF الكلية ${collegeName}:`, err.message);
    }
  }
  return files;
}

module.exports = { groupByCollege, generateAllCollegePDFs };
