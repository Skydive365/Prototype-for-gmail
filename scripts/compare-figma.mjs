// Screenshots every Email row variant from the running app and diffs it against the Figma export.
// Usage: start the app (npm run dev), then: npm run compare [-- --only <slug-part>]
// Output: .compare/<slug>-code.png, .compare/<slug>-diff.png and a summary table.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SCALE = 2; // Figma references are exported at 2x
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;

const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && existsSync(p));
if (!CHROME) throw new Error("Chrome or Edge not found. Set CHROME_PATH.");

const outDir = root + ".compare/";
mkdirSync(outDir, { recursive: true });

const variants = JSON.parse(readFileSync(root + "data/figma-variants.json", "utf8")).filter((v) => !only || v.slug.includes(only));
const rows = [];

for (const { slug } of variants) {
  const figma = PNG.sync.read(readFileSync(`${root}public/figma-ref/${slug}.png`));
  const codePath = `${outDir}${slug}-code.png`;

  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--force-device-scale-factor=${SCALE}`,
    `--window-size=${figma.width / SCALE},${figma.height / SCALE}`,
    "--virtual-time-budget=4000",
    `--screenshot=${codePath}`,
    `${BASE}/playground/variant/${slug}`,
  ], { stdio: "ignore" });

  const shot = PNG.sync.read(readFileSync(codePath));
  // Crop the screenshot to the Figma size (Chrome can add a pixel row)
  const code = new PNG({ width: figma.width, height: figma.height });
  PNG.bitblt(shot, code, 0, 0, Math.min(shot.width, figma.width), Math.min(shot.height, figma.height), 0, 0);

  const diff = new PNG({ width: figma.width, height: figma.height });
  const changed = pixelmatch(figma.data, code.data, diff.data, figma.width, figma.height, { threshold: 0.1, includeAA: false });
  writeFileSync(`${outDir}${slug}-diff.png`, PNG.sync.write(diff));

  const pct = (changed / (figma.width * figma.height)) * 100;
  rows.push({ slug, changedPixels: changed, percent: pct.toFixed(2) + "%" });
  console.log(`${pct < 1 ? "✓" : "✗"} ${slug.padEnd(52)} ${changed.toString().padStart(6)} px  ${pct.toFixed(2)}%`);
}

writeFileSync(outDir + "summary.json", JSON.stringify(rows, null, 2));
console.log(`\nDiff images in ${outDir}`);
