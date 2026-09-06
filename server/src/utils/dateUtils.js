function excelDateToJSDate(serial) {
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000).toISOString().split("T")[0];
}

function excelSerialToDate(serial) {
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

function parseDateSmart(value) {
  if (!value) return "مستمر";

  if (typeof value === "number") return excelSerialToDate(value);

  const str = String(value).trim();
  if (str === "مستمر") return "مستمر";

  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 3) {
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      return isNaN(d) ? "مستمر" : d;
    }
  }

  const d = new Date(str);
  return isNaN(d) ? "مستمر" : d;
}

function getArabicDayFromDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;

  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return days[d.getDay()];
}

function getMaxDateFromData(data) {
  let maxDate = null;
  data.forEach((row) => {
    const d = new Date(row.date);
    if (!isNaN(d) && (!maxDate || d > maxDate)) maxDate = d;
  });
  return maxDate;
}

module.exports = { excelDateToJSDate, excelSerialToDate, parseDateSmart, getArabicDayFromDate, getMaxDateFromData };
