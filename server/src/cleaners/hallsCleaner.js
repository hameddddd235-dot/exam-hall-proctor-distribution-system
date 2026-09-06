function cleanHallsCapacity(rawData) {
  return rawData
    .map((row) => {
      const hallKey     = Object.keys(row).find((k) => k.includes("القاعة"));
      const capacityKey = Object.keys(row).find((k) => k.includes("عدد"));
      return {
        hall:     row[hallKey]     ? String(row[hallKey]).trim() : null,
        capacity: row[capacityKey] ? Number(row[capacityKey])    : null,
      };
    })
    .filter((row) => row.hall && row.capacity);
}

module.exports = { cleanHallsCapacity };
