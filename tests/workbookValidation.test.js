const assert = require("node:assert/strict");

const {
  validateMonitorsWorkbook,
  validatePeriodsWorkbook,
  validateHallsWorkbook,
  validateConvertWorkbook,
} = require("../server/src/validation/workbookValidation");

function testMonitorWorkbookValidation() {
  assert.doesNotThrow(() =>
    validateMonitorsWorkbook(
      [{ الاسم: "أحمد", الدرجة: "دكتور", الكلية: "الهندسة" }],
      [{ الاسم: "سارة", الدرجة: "إداري", المديرية: "الامتحانات" }],
    ),
  );
}

function testPeriodsWorkbookValidation() {
  assert.throws(
    () =>
      validatePeriodsWorkbook([{ Date: "2026-05-01", Time: "08:00-10:00" }]),
    /القاعة/,
  );
}

function testHallsWorkbookValidation() {
  assert.throws(() => validateHallsWorkbook([{ اسم: "A1" }]), /عدد الطلاب/);
}

function testConvertWorkbookValidation() {
  assert.doesNotThrow(() =>
    validateConvertWorkbook([
      {
        المراقب: "أحمد",
        الدرجة: "دكتور",
        الكلية: "الهندسة",
        التاريخ: "2026-05-01",
        الفترة: "08:00-10:00",
        النوع: "أساسي",
        القاعة: "A1",
      },
    ]),
  );
}

module.exports = {
  testMonitorWorkbookValidation,
  testPeriodsWorkbookValidation,
  testHallsWorkbookValidation,
  testConvertWorkbookValidation,
};
