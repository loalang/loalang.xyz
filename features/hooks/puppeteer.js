const puppeteer = require("puppeteer");
require("pptr-testing-library/extend");

const { Before, After } = require("cucumber");

let inflight = 0;

async function idle() {
  do {
    await new Promise((r) => setTimeout(r, 100));
  } while (inflight > 0);
}

exports.idle = idle;

Before({ timeout: 10000 }, async () => {
  inflight = 0;

  const browser = (exports.browser = await puppeteer.launch({
    headless: process.env.RUN_CHROMIUM !== "yes",
  }));
  const page = (exports.page = await browser.newPage());
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    inflight++;
    request.continue();
  });

  page.on("requestfinished", () => {
    inflight--;
  });

  page.on("requestfailed", () => {
    inflight--;
  });

  await page.goto("http://localhost:9090");
  await idle();
});

After(async () => {
  await exports.browser.close();
});
