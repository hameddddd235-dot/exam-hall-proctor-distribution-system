// __dirname = server/src/generators
// browser.js موجود في server/browser/browser.js
const { getBrowser } = require("../../browser/browser");
const { generateHTMLFromMonitors, generateHTMLFromHalls, generateHTMLForCollege } = require("./htmlGenerators");

const PDF_OPTIONS = {
  format: "A4",
  margin: { top: "30mm", right: "30mm", bottom: "30mm", left: "30mm" },
  printBackground: true,
};

async function renderPDF(html, outputPath) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 0 });
    await page.pdf({ path: outputPath, ...PDF_OPTIONS });
    return outputPath;
  } catch (err) {
    await browser.close();
    throw err;
  }
}

const generatePDFWithPuppeteer  = (view, out) => renderPDF(generateHTMLFromMonitors(view), out);
const generatePDFFromHalls       = (view, out) => renderPDF(generateHTMLFromHalls(view), out);
const generatePDFForCollege      = (name, view, out) => renderPDF(generateHTMLForCollege(name, view), out);

module.exports = { generatePDFWithPuppeteer, generatePDFFromHalls, generatePDFForCollege };
