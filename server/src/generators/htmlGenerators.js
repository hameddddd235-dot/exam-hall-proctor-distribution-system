const fs   = require("fs");
const { getAssetPath } = require("../config/paths");
const { escapeHtml }   = require("../utils/htmlUtils");
const { getRole }      = require("../views/viewBuilders");

// EXAM-MO/assets/images/Kalamoon.png
const logoBase64 = fs.readFileSync(getAssetPath("assets", "images", "Kalamoon.png"), "base64");

// ─── مكونات مشتركة ────────────────────────────────────────────────────────────

function htmlShell(title, body) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 0; }
    body   { margin: 0; padding: 0; font-family: 'Amiri', Arial, sans-serif; direction: rtl; }
    .page  { width: 210mm; min-height: 297mm; padding: 30px; box-sizing: border-box; position: relative; }
    table  { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 9px; }
    th, td { font-size: 9px; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function pageHeader(title) {
  return `
  <div style="display:flex;justify-content:space-around;align-items:center;">
    <img src="data:image/png;base64,${logoBase64}" style="height:100px;width:100px;object-fit:contain;"/>
    <h1 style="text-align:center;color:#034ea2;font-size:18px;">${escapeHtml(title)}</h1>
  </div>
  <hr style="border:1.5px solid #034ea2;margin:10px 0 20px 0;">`;
}

function tableHead(cols) {
  const cells = cols.map(({ label, width }) =>
    `<th style="padding:10px;text-align:center;color:#fff;border:1px solid #034ea2;width:${width};">${label}</th>`
  ).join("");
  return `<thead><tr style="background-color:#034ea2;">${cells}</tr></thead>`;
}

function tableRow(cells, index) {
  const bg   = index % 2 === 0 ? "#f8f9fa" : "#ffffff";
  const tds  = cells.map((c) => `<td style="padding:8px;text-align:center;border:1px solid #dddddd;">${escapeHtml(c)}</td>`).join("");
  return `<tr style="background-color:${bg};">${tds}</tr>`;
}

function pageFooter(current, total) {
  return `<div style="position:absolute;bottom:20px;width:100%;text-align:center;color:#666;font-size:10px;">الصفحة ${current} من ${total}</div>`;
}

// ─── صفحة مراقب ───────────────────────────────────────────────────────────────

function monitorPage(monitor, index, total, showCollegeName = false) {
  const role  = getRole(monitor.degree);
  const title = showCollegeName
    ? `جدول المراقبات - ${showCollegeName}`
    : "جدول المراقبات";

  const rows = (monitor.assignments || []).length === 0
    ? `<tr><td colspan="4" style="text-align:center;color:#666;padding:20px;">لا توجد مراقبات مسجلة</td></tr>`
    : (monitor.assignments || []).map((a, i) => {
        const type    = a.type === "main" || a.type === "أساسي" ? "أساسي" : "احتياط";
        const details = type === "أساسي" ? `أساسي - القاعة: ${a.room || ""}` : "احتياط";
        return tableRow([a.date || "", a.period || "", role, details], i);
      }).join("");

  const COLS = [
    { label: "التاريخ",  width: "20%" },
    { label: "الفترة",   width: "20%" },
    { label: "المنصب",   width: "20%" },
    { label: "التفاصيل", width: "40%" },
  ];

  return `
  <div class="page" style="page-break-after:always;padding:30px;direction:rtl;">
    ${pageHeader(title)}
    <div style="margin-bottom:20px;text-align:center;">
      <h2 style="font-size:16px;color:#000;margin-bottom:10px;">المراقب/ة: ${escapeHtml(monitor.name || "")}</h2>
      <p style="font-size:12px;color:#333;margin:0;">
        الدرجة العلمية: ${escapeHtml(monitor.degree || "")} &nbsp;&nbsp;&nbsp;&nbsp; الكلية: ${escapeHtml(monitor.college || "")}
      </p>
    </div>
    <table>${tableHead(COLS)}<tbody>${rows}</tbody></table>
    ${!showCollegeName ? `<div style="margin-top:100px;"><h6 style="font-size:18px;">توقيع المراقب/ة:</h6></div>` : ""}
    ${pageFooter(index + 1, total)}
  </div>`;
}

// ─── صفحة قاعة ────────────────────────────────────────────────────────────────

function hallPage(hall, index, total) {
  const COLS = [
    { label: "المراقب/ة",     width: "25%" },
    { label: "الدرجة العلمية", width: "25%" },
    { label: "الكلية",         width: "25%" },
    { label: "المنصب",         width: "25%" },
  ];

  const monitors = hall.monitors || [];
  const rows = monitors.length === 0
    ? `<tr><td colspan="4" style="text-align:center;color:#666;padding:20px;">لا يوجد مراقبين</td></tr>`
    : monitors.map((m, i) => tableRow([m.name, m.degree, m.college, m.role], i)).join("");

  return `
  <div class="page" style="page-break-after:always;padding:30px;direction:rtl;">
    ${pageHeader("جدول القاعات")}
    <div style="margin-bottom:20px;text-align:center;">
      <h2 style="font-size:16px;color:#000;margin-bottom:10px;">القاعة: ${escapeHtml(hall.room || "")}</h2>
      <p style="font-size:12px;color:#333;margin:5px 0;">التاريخ: ${escapeHtml(hall.date || "")} &nbsp;&nbsp;&nbsp;&nbsp; اليوم: ${escapeHtml(hall.day || "")}</p>
      <p style="font-size:12px;color:#333;margin:5px 0;">الفترة: ${escapeHtml(hall.period || "")}</p>
    </div>
    <table>${tableHead(COLS)}<tbody>${rows}</tbody></table>
    ${pageFooter(index + 1, total)}
  </div>`;
}

// ─── الدوال المصدَّرة ─────────────────────────────────────────────────────────

function generateHTMLFromMonitors(monitorsView) {
  const pages = monitorsView.map((m, i) => monitorPage(m, i, monitorsView.length)).join("");
  return htmlShell("جدول المراقبات", pages);
}

function generateHTMLFromHalls(hallsView) {
  const pages = hallsView.map((h, i) => hallPage(h, i, hallsView.length)).join("");
  return htmlShell("جدول القاعات", pages);
}

function generateHTMLForCollege(collegeName, monitorsView) {
  const pages = monitorsView.map((m, i) => monitorPage(m, i, monitorsView.length, collegeName)).join("");
  return htmlShell(`جدول المراقبات - ${collegeName}`, pages);
}

module.exports = { generateHTMLFromMonitors, generateHTMLFromHalls, generateHTMLForCollege };
