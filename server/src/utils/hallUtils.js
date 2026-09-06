function normalizeHallName(name) {
  if (!name) return null;
  let str = String(name).trim().toUpperCase();
  str = str.replace(/^CNT/i, "").replace(/[-_\s]/g, "");
  return /^\d+$/.test(str) ? Number(str) : str;
}

function capacityToMonitors(capacity) {
  if (capacity >= 30) return 4;
  if (capacity <= 25) return 2;
  return 3;
}

function addMonitorsCountToPeriods(periods, halls) {
  const hallCapacityMap = new Map();
  halls.forEach((h) => {
    const key = normalizeHallName(h.hall);
    if (key && h.capacity != null) hallCapacityMap.set(key, h.capacity);
  });

  return periods.map((p) => {
    const capacity = hallCapacityMap.get(normalizeHallName(p.room));
    return { ...p, requiredMonitors: capacity != null ? capacityToMonitors(capacity) : 2 };
  });
}

module.exports = { normalizeHallName, capacityToMonitors, addMonitorsCountToPeriods };
