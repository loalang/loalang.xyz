const puppeteer = require("puppeteer");
require("pptr-testing-library/extend");

const { Before, After } = require("cucumber");

Before(async () => {
  exports.browser = await puppeteer.launch();
  exports.page = await exports.browser.newPage();
  await exports.page.goto("http://localhost:9090");
});

After(async () => {
  await exports.browser.close();
});
