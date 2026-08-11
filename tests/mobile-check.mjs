import { chromium } from "/Users/sgk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });

await page.goto("http://localhost:3010", { waitUntil: "networkidle" });
const home = await page.evaluate(() => ({
  viewport: innerWidth,
  body: document.body.scrollWidth,
  html: document.documentElement.scrollWidth,
  title: document.title,
  quickNavVisible: getComputedStyle(document.querySelector(".mobile-home-nav")).display !== "none",
}));
await page.screenshot({ path: "/tmp/retire-rich-mobile-home.png", fullPage: true });

await page.goto("http://localhost:3010/tools/retirement-runway", { waitUntil: "networkidle" });
const tool = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth, html: document.documentElement.scrollWidth, result: document.querySelector(".calculator-output strong")?.textContent }));
await page.screenshot({ path: "/tmp/retire-rich-mobile-tool.png", fullPage: true });

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
desktop.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
await desktop.goto("http://localhost:3010", { waitUntil: "networkidle" });
const desktopHome = await desktop.evaluate(() => {
  const primary = document.querySelector(".post-1")?.getBoundingClientRect();
  const secondary = document.querySelector(".post-2")?.getBoundingClientRect();
  return {
    viewport: innerWidth,
    body: document.body.scrollWidth,
    html: document.documentElement.scrollWidth,
    primaryHeight: primary?.height,
    secondaryHeight: secondary?.height,
    quickNavHidden: getComputedStyle(document.querySelector(".mobile-home-nav")).display === "none",
  };
});
await desktop.screenshot({ path: "/tmp/retire-rich-desktop-home.png", fullPage: true });

if (home.body > home.viewport || home.html > home.viewport || tool.body > tool.viewport || tool.html > tool.viewport || desktopHome.body > desktopHome.viewport || desktopHome.html > desktopHome.viewport) throw new Error(`horizontal overflow: ${JSON.stringify({home,tool,desktopHome})}`);
if (!home.quickNavVisible || !desktopHome.quickNavHidden) throw new Error(`responsive quick navigation mismatch: ${JSON.stringify({home,desktopHome})}`);
if (!desktopHome.primaryHeight || !desktopHome.secondaryHeight || desktopHome.primaryHeight <= desktopHome.secondaryHeight) throw new Error(`editorial post mosaic missing: ${JSON.stringify(desktopHome)}`);
if (!tool.result) throw new Error("calculator result missing");
if (errors.length) throw new Error(`browser console errors: ${errors.join(" | ")}`);
console.log(JSON.stringify({ home, tool, desktopHome, screenshots:["/tmp/retire-rich-mobile-home.png","/tmp/retire-rich-mobile-tool.png","/tmp/retire-rich-desktop-home.png"] }, null, 2));
await browser.close();
