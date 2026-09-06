const { getRole } = require("../views/viewBuilders");

function buildExcelRows(monitorsView) {
  const rows = [];
  monitorsView.forEach((monitor) => {
    const role = getRole(monitor.degree);
    (monitor.assignments || []).forEach((a) => {
      rows.push({
        المراقب:         monitor.name     || "",
        الدرجة:          monitor.degree   || "",
        الكلية:          monitor.college  || "",
        المنصب:          role,
        التاريخ:         a.date           || "",
        الفترة:          a.period         || "",
        النوع:           a.type === "main" ? "أساسي" : "احتياط",
        القاعة:          a.type === "main" ? a.room || "" : "",
        "عدد المراقبات": monitor.monitorCount || 0,
      });
    });
  });
  return rows;
}

module.exports = { buildExcelRows };
