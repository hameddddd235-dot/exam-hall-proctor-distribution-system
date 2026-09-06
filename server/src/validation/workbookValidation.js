const { AppError } = require("../errors/appError");

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function collectHeaders(rows) {
  const headers = new Set();
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => headers.add(normalizeHeader(key)));
  });
  return headers;
}

function hasHeader(headers, fragments) {
  return [...headers].some((header) =>
    fragments.some((fragment) => header.includes(normalizeHeader(fragment))),
  );
}

function requireSheet(workbook, index, label) {
  const sheetName = workbook.SheetNames[index];
  if (!sheetName) {
    throw new AppError(`الملف "${label}" لا يحتوي على الشيت المطلوب رقم ${index + 1}.`);
  }

  return workbook.Sheets[sheetName];
}

function requireRows(rows, label) {
  if (!rows.length) {
    throw new AppError(`الملف "${label}" لا يحتوي على بيانات قابلة للمعالجة.`);
  }
}

function assertHeaders(headers, label, checks) {
  const missing = checks
    .filter((check) => !hasHeader(headers, check.fragments))
    .map((check) => check.label);

  if (missing.length) {
    throw new AppError(`الملف "${label}" ينقصه الحقول المطلوبة: ${missing.join("، ")}.`);
  }
}

function validateMonitorsWorkbook(sheet1Rows, sheet2Rows) {
  requireRows(sheet1Rows, "المراقبين - الشيت الأول");
  requireRows(sheet2Rows, "المراقبين - الشيت الثاني");

  assertHeaders(collectHeaders(sheet1Rows), "المراقبين - الشيت الأول", [
    { label: "الاسم", fragments: ["الاسم"] },
    { label: "الدرجة", fragments: ["درجة"] },
    { label: "الكلية", fragments: ["كلية"] },
  ]);

  assertHeaders(collectHeaders(sheet2Rows), "المراقبين - الشيت الثاني", [
    { label: "الاسم", fragments: ["الاسم"] },
    { label: "الدرجة", fragments: ["درجة"] },
    { label: "المديرية", fragments: ["مديرية"] },
  ]);
}

function validatePeriodsWorkbook(rows) {
  requireRows(rows, "القاعات والفترات");
  assertHeaders(collectHeaders(rows), "القاعات والفترات", [
    { label: "التاريخ", fragments: ["date", "التاريخ"] },
    { label: "الفترة", fragments: ["time", "الفترة"] },
    { label: "القاعة", fragments: ["room", "القاعة"] },
  ]);
}

function validateHallsWorkbook(rows) {
  requireRows(rows, "سعة القاعات");
  assertHeaders(collectHeaders(rows), "سعة القاعات", [
    { label: "القاعة", fragments: ["القاعة"] },
    { label: "عدد الطلاب", fragments: ["عدد"] },
  ]);
}

function validateConvertWorkbook(rows) {
  requireRows(rows, "الملف المحدّث");
  assertHeaders(collectHeaders(rows), "الملف المحدّث", [
    { label: "المراقب", fragments: ["المراقب"] },
    { label: "الدرجة", fragments: ["الدرجة"] },
    { label: "الكلية", fragments: ["الكلية"] },
    { label: "التاريخ", fragments: ["التاريخ"] },
    { label: "الفترة", fragments: ["الفترة"] },
    { label: "النوع", fragments: ["النوع"] },
    { label: "القاعة", fragments: ["القاعة"] },
  ]);
}

module.exports = {
  requireSheet,
  validateMonitorsWorkbook,
  validatePeriodsWorkbook,
  validateHallsWorkbook,
  validateConvertWorkbook,
};
