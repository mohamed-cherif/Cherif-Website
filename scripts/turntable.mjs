// Usage: node scripts/turntable.mjs <modelId> <outDir> [--frames 72] [--size 640x360] [--el 30] [--zoom 1] [--open 0]
// Renders one full turn of a model from the dev server's /lab page as numbered
// PNG frames (frame-000.png ...). Encode them with ffmpeg afterwards.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { browserPath } from "./browser.mjs";

const args = process.argv.slice(2);
const [modelId, outDir] = args;
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const frames = +opt("frames", 72);
const [width, height] = String(opt("size", "640x360")).split("x").map(Number);
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: browserPath(),
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
const base = opt("base", "http://localhost:3000");
await page.goto(
  `${base}/lab?bare&nospin&id=${modelId}&az=0&el=${opt("el", 30)}&zoom=${opt("zoom", 1)}&open=${opt("open", 0)}`,
  { waitUntil: "networkidle2", timeout: 120000 }
);
await new Promise((r) => setTimeout(r, 3500));
for (let i = 0; i < frames; i++) {
  await page.evaluate((az) => window.dispatchEvent(new CustomEvent("lab-az", { detail: az })), (i * 360) / frames);
  await new Promise((r) => setTimeout(r, i === 0 ? 1500 : 450));
  await page.screenshot({ path: join(outDir, `frame-${String(i).padStart(3, "0")}.png`) });
}
await browser.close();
console.log(`${frames} frames in ${outDir}`);
