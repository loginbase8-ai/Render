import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

// GPU variant for Google Colab (T4): uses Chrome for Testing + ANGLE (hardware GL).
// usage: node scripts/render-video-gpu.mjs <start> <end> <scale> <output>
const start = Number(process.argv[2] ?? "0");
const end = Number(process.argv[3] ?? "29");
const scale = Number(process.argv[4] ?? "0.5");
const out = process.argv[5] ?? `out/bridge-${start}-${end}.mp4`;
process.env.REMOTION_TMP = path.resolve("remotion-tmp");
fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true });
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
console.log("bundled", serveUrl);
const composition = await selectComposition({ serveUrl, id: "BridgeShort", chromiumOptions, chromeMode: "chrome-for-testing" });
console.log("composition", composition.width, composition.height, composition.durationInFrames, "range", start, end, "scale", scale);
const t0 = Date.now();
await renderMedia({
  composition, serveUrl, codec: "h264", outputLocation: out, crf: 16,
  frameRange: [start, end], scale, chromiumOptions, chromeMode: "chrome-for-testing",
  timeoutInMilliseconds: 900000, concurrency: 1,
  onProgress: ({ renderedFrames, progress }) => { const line = `progress frames=${renderedFrames} ${(progress * 100).toFixed(1)}% elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`; console.log(line); fs.appendFileSync(path.resolve("out/progress.log"), new Date().toISOString() + " " + line + "\n"); },
  onBrowserLog: (l) => { if (l.type === "error") console.log(`[${l.type}]`, l.text.slice(0, 300)); },
});
console.log("done-gpu", out, ((Date.now() - t0) / 1000).toFixed(1) + "s");
