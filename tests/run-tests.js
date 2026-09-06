const distributionTests = require("./distribution.test");
const workbookValidationTests = require("./workbookValidation.test");

const tests = [
  ["chief assignment", distributionTests.testChiefAssignment],
  ["two main assignments limit", distributionTests.testTwoMainAssignmentsLimit],
  ["limited days priority", distributionTests.testLimitedDaysPriority],
  [
    "monitor workbook validation",
    workbookValidationTests.testMonitorWorkbookValidation,
  ],
  [
    "period workbook validation",
    workbookValidationTests.testPeriodsWorkbookValidation,
  ],
  [
    "halls workbook validation",
    workbookValidationTests.testHallsWorkbookValidation,
  ],
  [
    "convert workbook validation",
    workbookValidationTests.testConvertWorkbookValidation,
  ],
];

let passed = 0;

tests.forEach(([name, fn]) => {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
});

console.log(`\n${passed}/${tests.length} tests passed`);
