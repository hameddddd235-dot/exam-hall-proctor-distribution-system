const puppeteer = require("puppeteer");
const path = require("path");
let browser;

async function getBrowser() {
    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.pkg
          ? path.join(process.cwd(), "chrome-win64", "chrome.exe")
          : undefined,
      });
    }
    return browser;
  }

module.exports = { getBrowser };
