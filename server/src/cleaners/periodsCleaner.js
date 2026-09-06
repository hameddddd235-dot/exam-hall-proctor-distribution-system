const { excelDateToJSDate } = require("../utils/dateUtils");

function cleanUsedHalls(rawData) {
  const seen   = new Set();
  const result = [];

  rawData.forEach((row) => {
    let date   = row["Date"]  || row["التاريخ"];
    let time   = row["Time"]  || row["الفترة"];
    let room   = row["Room"]  || row["القاعة"];

    if (typeof date === "number") date = excelDateToJSDate(date);

    const d = String(date || "").trim();
    const t = String(time || "").trim();
    const r = String(room || "").trim();

    if (!d || !t || !r) return;

    const key = `${d}-${t}-${r}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ date: d, period: t, room: r });
    }
  });

  return result;
}

function sortPeriods(periods) {
  return periods.sort((a, b) => {
    const diff = new Date(a.date) - new Date(b.date);
    if (diff !== 0) return diff;
    return a.period.split("-")[0].localeCompare(b.period.split("-")[0]);
  });
}

module.exports = { cleanUsedHalls, sortPeriods };
