const { parseDateSmart } = require("../utils/dateUtils");

const BASE_DAYS     = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء"];
const EXTENDED_DAYS = [...BASE_DAYS, "الخميس"];

function buildMonitor(row, collegeKey, extraFields = {}) {
  const nameKey   = Object.keys(row).find((k) => k.includes("الاسم"));
  const degreeKey = Object.keys(row).find((k) => k.includes("درجة"));

  let workDays = BASE_DAYS.filter((day) => row[day]);
  if (workDays.length >= 3) workDays = EXTENDED_DAYS;

  return {
    name:         String(row[nameKey]    || "").trim(),
    degree:       String(row[degreeKey]  || "").trim(),
    college:      String(row[collegeKey] || "").trim(),
    workDays,
    monitorCount: 0,
    ...extraFields,
  };
}

function cleanTeachingStaffSheet1(rawData) {
  return rawData
    .filter((row) => !row["سبب عدم المراقبة"])
    .map((row) => {
      const collegeKey = Object.keys(row).find((k) => k.includes("كلية"));
      return buildMonitor(row, collegeKey, { directStatus: parseDateSmart(row["المباشرة"]) });
    });
}

function cleanTeachingStaffSheet2(rawData) {
  return rawData
    .filter((row) => !row["سبب عدم المراقبة"])
    .map((row) => {
      const collegeKey = Object.keys(row).find((k) => k.includes("مديرية"));
      return buildMonitor(row, collegeKey, { directStatus: "مستمر" });
    });
}

module.exports = { cleanTeachingStaffSheet1, cleanTeachingStaffSheet2 };
