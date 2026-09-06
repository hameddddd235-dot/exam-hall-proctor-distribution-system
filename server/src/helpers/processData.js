const XLSX = require("xlsx");

const { runDistribution, buildMonitorView } = require("../../algorithms/distribution");
const { AppError } = require("../errors/appError");
const { cleanTeachingStaffSheet1, cleanTeachingStaffSheet2 } = require("../cleaners/monitorsCleaner");
const { cleanUsedHalls, sortPeriods } = require("../cleaners/periodsCleaner");
const { cleanHallsCapacity } = require("../cleaners/hallsCleaner");
const { filterResignedMonitors } = require("../filters/monitorsFilter");
const { getArabicDayFromDate, getMaxDateFromData } = require("../utils/dateUtils");
const { addMonitorsCountToPeriods } = require("../utils/hallUtils");
const { buildHallView } = require("../views/viewBuilders");
const dataStore = require("../data/dataStore");
const {
  requireSheet,
  validateMonitorsWorkbook,
  validatePeriodsWorkbook,
  validateHallsWorkbook,
} = require("../validation/workbookValidation");

function readSheetRows(workbook, sheetIndex, label) {
  const sheet = requireSheet(workbook, sheetIndex, label);
  return XLSX.utils.sheet_to_json(sheet);
}

function buildProcessedData(monitorsSheet1Rows, monitorsSheet2Rows, periodsRows, hallsRows) {
  let cleanedSheet1 = cleanTeachingStaffSheet1(monitorsSheet1Rows);
  const cleanedSheet2 = cleanTeachingStaffSheet2(monitorsSheet2Rows);
  const halls = cleanHallsCapacity(hallsRows);

  let periods = cleanUsedHalls(periodsRows);
  periods = addMonitorsCountToPeriods(periods, halls);
  cleanedSheet1 = cleanedSheet1.filter((entry) => entry.workDays.length !== 0);
  periods = periods.map((period) => ({
    ...period,
    day: getArabicDayFromDate(period.date),
  }));
  periods = sortPeriods(periods);

  const monitorsAll = [...cleanedSheet1, ...cleanedSheet2];
  const maxPeriodDate = getMaxDateFromData(periods);
  const monitors = filterResignedMonitors(monitorsAll, maxPeriodDate);

  if (!periods.length) {
    throw new AppError("لم يتم العثور على فترات امتحان صالحة بعد تنظيف الملف.");
  }

  if (!halls.length) {
    throw new AppError("لم يتم العثور على قاعات صالحة في ملف سعة القاعات.");
  }

  if (!monitors.length) {
    throw new AppError("لم يتم العثور على مراقبين صالحين بعد تنظيف الملفات.");
  }

  const nextDataStore = {
    monitors,
    docAndMasters: monitors.filter(
      (monitor) =>
        monitor.degree.includes("دكتور") || monitor.degree.includes("ماجستير"),
    ),
    normalmonitors: monitors.filter(
      (monitor) =>
        !monitor.degree.includes("دكتور") &&
        !monitor.degree.includes("ماجستير"),
    ),
    periods,
    halls,
  };

  const schedule = runDistribution(nextDataStore);
  const monitorsView = buildMonitorView(schedule, monitors);
  const hallsView = buildHallView(schedule, monitors);

  return {
    ...nextDataStore,
    schedule,
    monitorsView,
    hallsView,
  };
}

function processFilesFromPaths(monitorsPath, periodsPath, hallsPath) {
  const monitorsWorkbook = XLSX.readFile(monitorsPath);
  const periodsWorkbook = XLSX.readFile(periodsPath);
  const hallsWorkbook = XLSX.readFile(hallsPath);

  const monitorsSheet1 = readSheetRows(monitorsWorkbook, 0, "المراقبين");
  const monitorsSheet2 = readSheetRows(monitorsWorkbook, 1, "المراقبين");
  const periodsRows = readSheetRows(periodsWorkbook, 0, "القاعات والفترات");
  const hallsRows = readSheetRows(hallsWorkbook, 0, "سعة القاعات");

  validateMonitorsWorkbook(monitorsSheet1, monitorsSheet2);
  validatePeriodsWorkbook(periodsRows);
  validateHallsWorkbook(hallsRows);

  const processedData = buildProcessedData(
    monitorsSheet1,
    monitorsSheet2,
    periodsRows,
    hallsRows,
  );

  Object.assign(dataStore, processedData);

  return {
    schedule: processedData.schedule,
    monitorsView: processedData.monitorsView,
    hallsView: processedData.hallsView,
    monitors: processedData.monitors,
  };
}

function getOrProcessFromStore(req) {
  const files = req.files;
  const hasFreshFiles =
    files &&
    files.monitorsFile &&
    files.periodsFile &&
    files.hallsCapacityFile &&
    files.monitorsFile[0] &&
    files.periodsFile[0] &&
    files.hallsCapacityFile[0];

  if (hasFreshFiles) {
    return processFilesFromPaths(
      files.monitorsFile[0].path,
      files.periodsFile[0].path,
      files.hallsCapacityFile[0].path,
    );
  }

  if (dataStore.schedule && dataStore.monitorsView && dataStore.hallsView) {
    return {
      schedule: dataStore.schedule,
      monitorsView: dataStore.monitorsView,
      hallsView: dataStore.hallsView,
      monitors: dataStore.monitors,
    };
  }

  return null;
}

module.exports = {
  processFilesFromPaths,
  getOrProcessFromStore,
  buildProcessedData,
};
