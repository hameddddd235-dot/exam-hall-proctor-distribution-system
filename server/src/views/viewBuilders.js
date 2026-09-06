function getRole(degree) {
  if (!degree) return "مراقب";
  return String(degree).includes("دكتور") || String(degree).includes("ماجستير")
    ? "رئيس"
    : "مراقب";
}

function buildHallView(schedule, allMonitors) {
  const monitorMap = new Map();
  allMonitors.forEach((m) => monitorMap.set(m.name, m));

  const hallMap = new Map();

  schedule.forEach(({ date, day, period, room, mainMonitors }) => {
    if (!room) return;
    const key = `${date}_${period}_${room}`;

    if (!hallMap.has(key)) hallMap.set(key, { date, day, period, room, monitors: [] });

    mainMonitors.forEach((m) => {
      const info = monitorMap.get(m.name);
      if (info) {
        hallMap.get(key).monitors.push({
          name:    info.name,
          degree:  info.degree  || "",
          college: info.college || "",
          role:    getRole(info.degree),
        });
      }
    });
  });

  return Array.from(hallMap.values()).sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;
    if (a.period < b.period) return -1;
    if (a.period > b.period) return 1;
    return (a.room || "").localeCompare(b.room || "");
  });
}

module.exports = { getRole, buildHallView };
