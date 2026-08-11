import { chromium } from "/Users/sgk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });

await page.goto("http://localhost:3010", { waitUntil: "networkidle" });
const home = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth, html: document.documentElement.scrollWidth, title: document.title }));
await page.screenshot({ path: "/tmp/retire-rich-mobile-home.png", fullPage: true });

await page.goto("http://localhost:3010/tools/retirement-runway", { waitUntil: "networkidle" });
const tool = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth, html: document.documentElement.scrollWidth, result: document.querySelector(".calculator-output strong")?.textContent }));
await page.screenshot({ path: "/tmp/retire-rich-mobile-tool.png", fullPage: true });

if (home.body > home.viewport || home.html > home.viewport || tool.body > tool.viewport || tool.html > tool.viewport) throw new Error(`horizontal overflow: ${JSON.stringify({home,tool})}`);
if (!tool.result) throw new Error("calculator result missing");
if (errors.length) throw new Error(`browser console errors: ${errors.join(" | ")}`);
console.log(JSON.stringify({ home, tool, screenshots:["/tmp/retire-rich-mobile-home.png","/tmp/retire-rich-mobile-tool.png"] }, null, 2));
await browser.close();
