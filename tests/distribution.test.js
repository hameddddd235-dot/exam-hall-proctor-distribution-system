const assert = require("node:assert/strict");

const {
  runDistribution,
  buildMonitorView,
} = require("../server/algorithms/distribution");

function createMonitor(name, degree, workDays) {
  return {
    name,
    degree,
    college: "Test College",
    workDays,
    monitorCount: 0,
  };
}

function testChiefAssignment() {
  const dataStore = {
    periods: [
      {
        date: "2026-05-01",
        day: "الخميس",
        period: "08:00-10:00",
        room: "A1",
        requiredMonitors: 3,
      },
    ],
    docAndMasters: [
      createMonitor("Chief A", "دكتور", ["الخميس"]),
      createMonitor("Chief B", "ماجستير", ["الخميس"]),
    ],
    normalmonitors: [
      createMonitor("Normal 1", "مراقب", ["الخميس"]),
      createMonitor("Normal 2", "مراقب", ["الخميس"]),
      createMonitor("Normal 3", "مراقب", ["الخميس"]),
    ],
  };

  const schedule = runDistribution(dataStore);
  assert.equal(schedule.length, 1);
  assert.equal(schedule[0].mainMonitors[0].name, "Chief A");
  assert.equal(schedule[0].mainMonitors[0].role, "chief");
  assert.equal(
    schedule[0].reserveMonitors.some((monitor) => monitor.name === "Chief A"),
    false,
  );
}

function testTwoMainAssignmentsLimit() {
  const day = "الأحد";
  const dataStore = {
    periods: [
      {
        date: "2026-05-03",
        day,
        period: "08:00-09:00",
        room: "A1",
        requiredMonitors: 2,
      },
      {
        date: "2026-05-03",
        day,
        period: "09:30-10:30",
        room: "A2",
        requiredMonitors: 2,
      },
      {
        date: "2026-05-03",
        day,
        period: "11:00-12:00",
        room: "A3",
        requiredMonitors: 2,
      },
    ],
    docAndMasters: [
      createMonitor("Chief 1", "دكتور", [day]),
      createMonitor("Chief 2", "دكتور", [day]),
      createMonitor("Chief 3", "دكتور", [day]),
    ],
    normalmonitors: [
      createMonitor("Normal 1", "مراقب", [day]),
      createMonitor("Normal 2", "مراقب", [day]),
      createMonitor("Normal 3", "مراقب", [day]),
    ],
  };

  const schedule = runDistribution(dataStore);
  const monitorsView = buildMonitorView(schedule, [
    ...dataStore.docAndMasters,
    ...dataStore.normalmonitors,
  ]);

  dataStore.normalmonitors.forEach((inputMonitor) => {
    const monitor = monitorsView.find(
      (entry) => entry.name === inputMonitor.name,
    );
    assert.ok(monitor);
    assert.ok(
      monitor.assignments.filter((assignment) => assignment.type === "main")
        .length <= 2,
    );
  });
}

function testLimitedDaysPriority() {
  const dataStore = {
    periods: [
      {
        date: "2026-05-04",
        day: "الاثنين",
        period: "08:00-10:00",
        room: "B1",
        requiredMonitors: 2,
      },
    ],
    docAndMasters: [createMonitor("Chief A", "دكتور", ["الاثنين"])],
    normalmonitors: [
      createMonitor("Limited Monitor", "مراقب", ["الاثنين"]),
      createMonitor("Regular Monitor", "مراقب", [
        "الاثنين",
        "الثلاثاء",
        "الأربعاء",
      ]),
    ],
  };

  const schedule = runDistribution(dataStore);
  assert.equal(schedule[0].mainMonitors[1].name, "Limited Monitor");
}

module.exports = {
  testChiefAssignment,
  testTwoMainAssignmentsLimit,
  testLimitedDaysPriority,
};
