// Usage: node scripts/check-videos.mjs <url> [<url> ...]
// Scrolls every <video> on each page into view and reports whether it plays
// under the browser's normal autoplay policy (no special flags).
import puppeteer from "puppeteer-core";
import { browserPath } from "./browser.mjs";

const urls = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: browserPath(),
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
let failures = 0;
for (const url of urls) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).split("\n")[0]));
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 2500));
  const results = await page.evaluate(async () => {
    const out = [];
    for (const v of document.querySelectorAll("video")) {
      v.scrollIntoView({ block: "center", behavior: "instant" });
      await new Promise((r) => setTimeout(r, 1800));
      // clips on a hidden breakdown layer are not expected to play
      const shown = getComputedStyle(v.closest("[aria-hidden='true']") ?? v).opacity !== "0" && !v.closest("[aria-hidden='true']");
      out.push({
        src: v.currentSrc.split("/").slice(-2).join("/"),
        shown,
        playing: !v.paused && v.currentTime > 0,
        size: `${v.videoWidth}x${v.videoHeight}`,
        error: v.error?.message ?? null,
      });
    }
    return out;
  });
  const bad = results.filter((r) => r.shown && !r.playing);
  failures += bad.length + errors.length;
  console.log(`${url}: ${results.filter((r) => r.shown).length - bad.length}/${results.filter((r) => r.shown).length} visible clips playing` + (errors.length ? `  PAGE ERRORS: ${errors.join(" | ")}` : ""));
  for (const r of bad) console.log(`  NOT PLAYING ${r.src} ${r.size} ${r.error ?? ""}`);
  await page.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
