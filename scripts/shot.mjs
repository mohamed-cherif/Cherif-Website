// Usage: node scripts/shot.mjs <url> <out.png> [--scrolls 0,900,...] [--size 1280x800] [--wait 2500] [--full] [--scroll <px|selector>] [--eval "<js>"] [--theme light|dark]
// Screenshots a page in headless Edge/Chrome (real animation frames + WebGL).
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1] ?? true;
};
const [width, height] = String(opt("size", "1280x800")).split("x").map(Number);
import { browserPath } from "./browser.mjs";
const exe = browserPath();

const browser = await puppeteer.launch({
  executablePath: exe,
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const theme = opt("theme", null);
if (theme) await page.evaluateOnNewDocument((t) => localStorage.setItem("theme", t), theme);
await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
const scroll = opt("scroll", null);
if (scroll) {
  await page.evaluate((s) => {
    if (/^\d+$/.test(s)) window.scrollTo(0, +s);
    else document.querySelector(s)?.scrollIntoView({ block: "start" });
  }, String(scroll));
}
const js = opt("eval", null);
if (js) await page.evaluate(js);
await new Promise((r) => setTimeout(r, +opt("wait", 2500)));
// --scrolls 0,900,1800 saves one screenshot per scroll position: out-0.png, out-1.png ...
const scrolls = opt("scrolls", null);
if (scrolls) {
  const ys = String(scrolls).split(",").map(Number);
  for (let i = 0; i < ys.length; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), ys[i]);
    await new Promise((r) => setTimeout(r, +opt("settle", 1600)));
    await page.screenshot({ path: out.replace(/\.png$/, `-${i}.png`) });
  }
} else {
  await page.screenshot({ path: out, fullPage: args.includes("--full") });
}
if (errors.length) console.log("PAGE ERRORS:\n" + [...new Set(errors)].slice(0, 8).join("\n"));
console.log(`saved ${out}`);
await browser.close();
