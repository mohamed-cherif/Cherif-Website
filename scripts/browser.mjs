// Finds a Chromium-based browser for the capture scripts.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function browserPath() {
  if (process.env.BROWSER_PATH && existsSync(process.env.BROWSER_PATH)) return process.env.BROWSER_PATH;
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ];
  // Playwright's downloaded Chromium, if present
  const pw = join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (existsSync(pw)) {
    for (const dir of readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
      candidates.push(join(pw, dir, "chrome-win64", "chrome.exe"));
    }
  }
  const found = candidates.find(existsSync);
  if (!found) throw new Error("No Chromium-based browser found. Set BROWSER_PATH.");
  return found;
}
