function filterResignedMonitors(monitors, maxExamDate) {
  return monitors.filter((monitor) => {
    const status = monitor.directStatus;
    if (!status || status === "مستمر") return true;
    if (status instanceof Date && status < maxExamDate) return false;
    return true;
  });
}

module.exports = { filterResignedMonitors };
