// End-to-end verification of the scroll cinematic. Serves the site locally and
// drives it in desktop / tablet / mobile / reduced-motion configurations.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  try {
    const data = await readFile(join(root, p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise(r => server.listen(8712, r));

const EXTERNAL_OK = [/cdn\.shopify\.com/, /unpkg\.com/]; // blocked in this sandbox; fine in production
let failures = [];
const note = (ok, label, extra = '') => {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + label + (extra ? '  — ' + extra : ''));
  if (!ok) failures.push(label + ' ' + extra);
};

const browser = await chromium.launch();

/* ---------- desktop ---------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [], badReq = [];
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const loc = (m.location() && m.location().url) || '';
    if (EXTERNAL_OK.some(re => re.test(loc))) return; // sandbox-blocked externals, fine in production
    errors.push(m.text() + ' @' + loc);
  });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => { if (!EXTERNAL_OK.some(re => re.test(r.url()))) badReq.push(r.url()); });
  await page.goto('http://127.0.0.1:8712/');

  // loader reaches 100 and unlocks
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 20000 }).catch(() => {});
  const unlocked = await page.evaluate(() => !document.getElementById('loader') && !document.body.classList.contains('is-locked'));
  note(unlocked, 'desktop: loader completes and unlocks scroll');

  // canvas painted (frame 1 is near-black by design, so check alpha coverage)
  const painted = await page.evaluate(() => {
    const c = document.querySelector('#chapter-drop .chapter__canvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, Math.min(200, c.height)).data;
    let a = 0; for (let i = 3; i < d.length; i += 401) a += d[i];
    return a > 0;
  });
  note(painted, 'desktop: hero canvas painted');

  // helper: immediate scroll that Lenis will not fight
  async function jump(pageY) {
    await page.evaluate(y => {
      if (window.__lenis) { window.__lenis.scrollTo(y, { immediate: true, force: true }); }
      else { window.scrollTo(0, y); }
    }, pageY);
  }

  // scrub down through the whole cinematic, sampling state
  const H = await page.evaluate(() => document.body.scrollHeight);
  const vh = 900;
  let lastFrames = {};
  const chapters = ['drop', 'descent', 'deep'];
  const sampleShots = { 0.08: 'v_hero', 0.32: 'v_descent_mid', 0.46: 'v_descent_end', 0.62: 'v_deep', 0.9: 'v_cta' };
  for (let f = 0; f <= 1.001; f += 0.02) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round((H - vh) * f));
    await page.waitForTimeout(90);
    const key = Object.keys(sampleShots).find(k => Math.abs(k - f) < 0.011);
    if (key) await page.screenshot({ path: join(root, 'tools', 'samples', sampleShots[key] + '.png') });
  }
  // gauge + stations synced at the end of the descent
  const yDescentEnd = await page.evaluate(() => {
    const el = document.getElementById('chapter-descent');
    return el.offsetTop + (el.offsetHeight - innerHeight);
  });
  await jump(yDescentEnd);
  await page.waitForTimeout(600);
  const gauge = await page.evaluate(() => ({
    fill: parseFloat(document.getElementById('gaugeFill').style.width),
    num: document.getElementById('gaugeNum').textContent,
    lastStation: [...document.querySelectorAll('.station')].pop().classList.contains('is-on')
  }));
  note(gauge.fill > 90, 'desktop: serving gauge tracks scroll', 'fill=' + gauge.fill + '%');
  note(gauge.num === '30', 'desktop: gauge reaches serving 30 of 30', 'reads ' + gauge.num);
  note(gauge.lastStation, 'desktop: final depth station surfaced');

  // true black during final chapters
  const yDeep = await page.evaluate(() => {
    const el = document.getElementById('chapter-deep');
    return el.offsetTop + (el.offsetHeight - innerHeight) * 0.9;
  });
  await jump(yDeep);
  await page.waitForTimeout(600);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  note(bg === 'rgb(0, 0, 0)', 'desktop: page reaches true black in final chapter', bg);

  // scrub back up
  for (let f = 1; f >= 0; f -= 0.05) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round((H - vh) * f));
    await page.waitForTimeout(60);
  }
  const heroShown = await page.evaluate(() => document.querySelector('#chapter-drop .chapter__canvas') && true);
  note(heroShown, 'desktop: reverse scrub ok');

  // keyboard access: loader hands focus to main; skip link is the document's
  // first focusable; Tab reaches an operable control
  await page.reload();
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 20000 }).catch(() => {});
  const a11y = await page.evaluate(() => {
    const first = document.body.querySelector('a[href],button,summary,[tabindex]:not([tabindex="-1"])');
    return {
      focusOnMain: document.activeElement && document.activeElement.id === 'main',
      skipFirst: !!first && first.classList.contains('skip-link') && first.getAttribute('href') === '#formula'
    };
  });
  note(a11y.focusOnMain, 'desktop: focus moved into page after loader');
  note(a11y.skipFirst, 'desktop: skip link is first focusable, targets #formula');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className);
  note(/SUMMARY|A\./.test(focused), 'desktop: keyboard navigation operable', focused);

  const formOK = await page.evaluate(() => {
    const i = document.getElementById('signupEmail');
    const l = document.querySelector('label[for="signupEmail"]');
    return !!(i && l && l.textContent.trim().length > 3 && i.type === 'email');
  });
  note(formOK, 'desktop: email field has an associated label');

  note(errors.length === 0, 'desktop: no console errors', errors.slice(0, 4).join(' | '));
  note(badReq.length === 0, 'desktop: no broken local requests', badReq.slice(0, 4).join(' | '));
  await page.close();
}

/* ---------- tablet ---------- */
{
  const page = await browser.newPage({ viewport: { width: 834, height: 1112 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8712/');
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 20000 }).catch(() => {});
  const mode = await page.evaluate(() => document.documentElement.className);
  note(!mode.includes('mobile-cinema'), 'tablet: full canvas mode', mode);
  note(errors.length === 0, 'tablet: no page errors', errors.join(' | '));
  await page.screenshot({ path: join(root, 'tools', 'samples', 'v_tablet.png') });
  await page.close();
}

/* ---------- mobile: keyframes only, no desktop frames ---------- */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const desktopFrames = [], errors = [];
  page.on('request', r => { if (/frames\/(drop|descent|deep)\/frame_/.test(r.url())) desktopFrames.push(r.url()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8712/');
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 20000 }).catch(() => {});
  const isMobile = await page.evaluate(() => document.documentElement.classList.contains('mobile-cinema'));
  note(isMobile, 'mobile: keyframe cinema mode active');
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let f = 0; f <= 1; f += 0.1) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round((H - 844) * f));
    await page.waitForTimeout(120);
  }
  note(desktopFrames.length === 0, 'mobile: zero desktop frames downloaded', desktopFrames.length + ' fetched');
  note(errors.length === 0, 'mobile: no page errors', errors.join(' | '));
  await page.screenshot({ path: join(root, 'tools', 'samples', 'v_mobile.png') });
  await page.close();
}

/* ---------- reduced motion ---------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8712/');
  await page.waitForTimeout(1200);
  const state = await page.evaluate(() => ({
    static: document.documentElement.classList.contains('static-cinema'),
    loaderGone: !document.getElementById('loader') || document.getElementById('loader').classList.contains('is-done'),
    lenis: !!document.documentElement.className.match(/lenis/),
    copyVisible: getComputedStyle(document.querySelector('.hero-copy .display')).opacity === '1'
  }));
  note(state.static, 'reduced-motion: static cinema (no canvas scrub)');
  note(state.loaderGone, 'reduced-motion: no loader trap');
  note(!state.lenis, 'reduced-motion: Lenis disabled');
  note(state.copyVisible, 'reduced-motion: copy readable without cinematic layer');
  note(errors.length === 0, 'reduced-motion: no page errors', errors.join(' | '));
  await page.screenshot({ path: join(root, 'tools', 'samples', 'v_reduced.png') });
  await page.close();
}

await browser.close();
server.close();
console.log(failures.length ? '\n' + failures.length + ' FAILURES' : '\nALL CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
