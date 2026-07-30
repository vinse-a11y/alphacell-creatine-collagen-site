// Renders the scroll-cinematic frame sequences from tools/renderer.html.
// Usage:
//   node tools/render-frames.mjs sample          -> a handful of art-direction stills
//   node tools/render-frames.mjs full            -> 3 x 150 desktop frames @1600x900 + mobile keyframes
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] || 'sample';

const CHAPTERS = ['elements', 'formation', 'ritual'];
const FRAMES = 150;
const W = 1600, H = 900;
const JPEG_Q = 0.86; // ~ ffmpeg -q:v 3

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exitCode = 1; });
await page.goto('file://' + join(root, 'tools', 'renderer.html'));
await page.evaluate(([w, h]) => window.__setSize(w, h), [W, H]);

async function shot(T, q = JPEG_Q) {
  return await page.evaluate(([T, q]) => { window.__render(T); return window.__shot(q); }, [T, q]);
}
function save(path, dataUrl) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(dataUrl.split(',')[1], 'base64'));
}

if (mode === 'sample') {
  const samples = [0.05, 0.35, 0.7, 0.98, 1.2, 1.55, 1.85, 1.99, 2.15, 2.5, 2.75, 2.98];
  for (const T of samples) {
    save(join(root, 'tools', 'samples', `T${T.toFixed(2).replace('.', '_')}.jpg`), await shot(T));
    console.log('sample', T);
  }
} else {
  // desktop sequences
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < FRAMES; i++) {
      const T = c + i / FRAMES;
      const file = join(root, 'frames', CHAPTERS[c], `frame_${String(i + 1).padStart(4, '0')}.jpg`);
      save(file, await shot(T));
    }
    console.log('chapter done:', CHAPTERS[c]);
  }
  // mobile keyframes: 20 per chapter @ 960x540
  await page.setViewportSize({ width: 960, height: 540 });
  await page.evaluate(() => window.__setSize(960, 540));
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < 20; i++) {
      const T = c + i / 20 + 0.5 / 20;
      const file = join(root, 'frames', 'mobile', CHAPTERS[c], `key_${String(i + 1).padStart(2, '0')}.jpg`);
      save(file, await shot(Math.min(T, 2.997), 0.8));
    }
  }
  console.log('mobile keyframes done');
}
await browser.close();
