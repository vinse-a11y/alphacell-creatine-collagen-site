/* Alphacell — Creatine & Collagen scroll cinematic engine */
(function () {
  'use strict';

  var html = document.documentElement;
  html.classList.remove('no-js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isNarrow = window.matchMedia('(max-width: 640px)').matches;
  var canvasOK = (function () {
    try { var c = document.createElement('canvas'); return !!(c.getContext && c.getContext('2d')); }
    catch (e) { return false; }
  })();

  // mode: 'full' (desktop canvas scrub) | 'keyframes' (mobile img scrub) | 'static'
  var mode = reducedMotion || !canvasOK ? 'static' : (isNarrow ? 'keyframes' : 'full');

  var CHAPTERS = ['elements', 'formation', 'ritual'];
  // background colour stops: #171A1D -> #0D1114 -> #050606 -> #000000
  var STOPS = [[23, 26, 29], [13, 17, 20], [5, 6, 6], [0, 0, 0]];
  var FRAME_COUNT = 150;
  var KEY_COUNT = 20;
  var loader = document.getElementById('loader');
  var loaderPct = document.getElementById('loaderPct');
  var sections = CHAPTERS.map(function (name) {
    var el = document.getElementById('chapter-' + name);
    return {
      name: name,
      el: el,
      pin: el.querySelector('.chapter__pin'),
      canvas: el.querySelector('.chapter__canvas'),
      poster: el.querySelector('.chapter__poster'),
      ctx: null,
      progress: 0,
      shown: -1,     // painted frame
      smooth: 0      // interpolated frame position
    };
  });

  function frameURL(chapter, i) {
    return 'frames/' + chapter + '/frame_' + String(i + 1).padStart(4, '0') + '.jpg';
  }
  function keyURL(chapter, i) {
    return 'frames/mobile/' + chapter + '/key_' + String(i + 1).padStart(2, '0') + '.jpg';
  }

  /* ---------------- static mode: nothing to orchestrate ---------------- */
  if (mode === 'static') {
    html.classList.add('mobile-cinema', 'static-cinema'); // posters visible, canvases hidden, pins collapsed
    if (loader) { loader.classList.add('is-done'); loader.setAttribute('aria-hidden', 'true'); }
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-on'); });
    document.querySelectorAll('.meter__stage').forEach(function (el) { el.classList.add('is-active'); });
    var pr = document.getElementById('productRender');
    if (pr) { pr.classList.add('is-on'); }
    wireImageFallbacks();
    return;
  }

  /* ---------------- shared: asset bookkeeping for the preloader ---------------- */
  var critTotal = 0, critDone = 0, firstPaintDone = false, unlocked = false;
  function critTick() {
    critDone++;
    updateLoader();
  }
  function updateLoader() {
    var total = critTotal + 1; // +1 for first canvas paint
    var done = critDone + (firstPaintDone ? 1 : 0);
    var pct = Math.min(100, Math.round(done / total * 100));
    if (loaderPct) { loaderPct.textContent = String(pct); }
    if (pct >= 100 && !unlocked) { unlock(); }
  }
  function unlock() {
    unlocked = true;
    document.body.classList.remove('is-locked');
    if (loader) {
      loader.classList.add('is-done');
      loader.setAttribute('aria-hidden', 'true');
      window.setTimeout(function () { if (loader.parentNode) { loader.parentNode.removeChild(loader); } }, 900);
    }
    var main = document.getElementById('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); }
    }
  }
  // Safety: never trap the visitor if the network stalls (content stays usable;
  // remaining frames continue streaming in the background).
  window.setTimeout(function () { if (!unlocked) { unlock(); } }, 12000);

  document.body.classList.add('is-locked');

  // fonts count toward critical loading
  var fontSpecs = ['300 1rem Manrope', '400 1rem Inter'];
  fontSpecs.forEach(function (spec) {
    critTotal++;
    document.fonts.load(spec).then(critTick, critTick);
  });

  /* ---------------- image loading ---------------- */
  function loadImage(src, cb) {
    var img = new Image();
    img.onload = function () {
      if (img.decode) { img.decode().then(function () { cb(img); }, function () { cb(img); }); }
      else { cb(img); }
    };
    img.onerror = function () { cb(null); };
    img.src = src;
    return img;
  }

  /* ---------------- keyframes mode (narrow screens) ---------------- */
  if (mode === 'keyframes') {
    html.classList.add('mobile-cinema');
    var keys = {};
    CHAPTERS.forEach(function (name, ci) {
      keys[name] = new Array(KEY_COUNT);
      for (var i = 0; i < KEY_COUNT; i++) {
        (function (name, i, ci) {
          var critical = ci === 0; // first chapter gates the loader
          if (critical) { critTotal++; }
          loadImage(keyURL(name, i), function (img) {
            keys[name][i] = img;
            if (critical) { critTick(); }
          });
        })(name, i, ci);
      }
    });
    firstPaintDone = true; // no canvas paint in this mode
    updateLoader();

    var shownKey = [-1, -1, -1];
    function tickMobile() {
      sections.forEach(function (s, si) {
        var rect = s.el.getBoundingClientRect();
        var vh = window.innerHeight;
        var span = s.el.offsetHeight - vh;
        var p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
        s.progress = p;
        var idx = Math.min(KEY_COUNT - 1, Math.round(p * (KEY_COUNT - 1)));
        // nearest loaded at or below idx
        while (idx > 0 && !keys[s.name][idx]) { idx--; }
        if (keys[s.name][idx] && idx !== shownKey[si]) {
          shownKey[si] = idx;
          s.poster.src = keys[s.name][idx].src;
        }
      });
      driveCopy();
      window.requestAnimationFrame(tickMobile);
    }
    window.requestAnimationFrame(tickMobile);
    wireImageFallbacks();
    wireProductReveal();
    return;
  }

  /* ---------------- full mode: canvas sequence scrubbing ---------------- */
  var store = {}; // chapter -> array of images (or undefined)
  var pending = []; // [{c: chapterIdx, i: frameIdx}]
  CHAPTERS.forEach(function (name, ci) {
    store[name] = new Array(FRAME_COUNT);
    for (var i = 0; i < FRAME_COUNT; i++) { pending.push({ c: ci, i: i }); }
  });

  var CRITICAL_N = 30; // first frames of chapter one gate the preloader
  critTotal += CRITICAL_N;

  var activeChapter = 0, activeFrame = 0;
  function priority(job) {
    // lower = sooner. Active chapter frames ordered by distance to playhead;
    // neighbouring chapters follow; distant chapters last.
    var chapDist = Math.abs(job.c - activeChapter);
    var frameDist = job.c === activeChapter ? Math.abs(job.i - activeFrame)
      : (job.c > activeChapter ? job.i : FRAME_COUNT - job.i);
    return chapDist * 1000 + frameDist;
  }
  var inflight = 0, MAX_INFLIGHT = 6;
  function pump() {
    if (!pending.length || inflight >= MAX_INFLIGHT) { return; }
    // pick best job (linear scan is fine at this scale)
    var best = 0;
    for (var k = 1; k < pending.length; k++) {
      if (priority(pending[k]) < priority(pending[best])) { best = k; }
    }
    var job = pending.splice(best, 1)[0];
    inflight++;
    var name = CHAPTERS[job.c];
    loadImage(frameURL(name, job.i), function (img) {
      inflight--;
      if (img) { store[name][job.i] = img; }
      if (job.c === 0 && job.i < CRITICAL_N) { critTick(); }
      var s = sections[job.c];
      if (s.shown === -1 || Math.abs(job.i - s.smooth) < 3) { s.shown = -2; } // force repaint if relevant
      pump();
    });
    pump();
  }
  for (var p0 = 0; p0 < MAX_INFLIGHT; p0++) { pump(); }

  /* canvas sizing (cover) */
  var FRAME_W = 1600, FRAME_H = 900;
  function sizeCanvases() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    sections.forEach(function (s) {
      var w = s.pin.clientWidth, h = s.pin.clientHeight;
      s.canvas.width = Math.round(w * dpr);
      s.canvas.height = Math.round(h * dpr);
      s.ctx = s.canvas.getContext('2d');
      s.shown = -2; // force repaint
    });
  }
  window.addEventListener('resize', sizeCanvases);
  sizeCanvases();

  function paint(s, idx) {
    var img = store[s.name][idx];
    if (!img) { // nearest loaded fallback
      for (var d = 1; d < FRAME_COUNT; d++) {
        if (idx - d >= 0 && store[s.name][idx - d]) { img = store[s.name][idx - d]; idx = idx - d; break; }
        if (idx + d < FRAME_COUNT && store[s.name][idx + d]) { img = store[s.name][idx + d]; idx = idx + d; break; }
      }
    }
    if (!img || !s.ctx) { return false; }
    var cw = s.canvas.width, chh = s.canvas.height;
    var scale = Math.max(cw / FRAME_W, chh / FRAME_H);
    var dw = FRAME_W * scale, dh = FRAME_H * scale;
    s.ctx.drawImage(img, (cw - dw) / 2, (chh - dh) / 2, dw, dh);
    return true;
  }

  /* Lenis smooth scrolling */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ autoRaf: false, lerp: 0.1 });
    window.__lenis = lenis; // exposed for QA tooling
  }

  /* background colour sync (formation: #171A1D -> #0D1114 -> #050606, ritual -> #000) */
  function mixc(a, b, t) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  function syncBackground() {
    var f = sections[1].progress, r = sections[2].progress;
    var col;
    if (r > 0) { col = mixc(STOPS[2], STOPS[3], Math.min(1, r * 2.2)); }
    else if (f > 0) {
      col = f < 0.5 ? mixc(STOPS[0], STOPS[1], f * 2) : mixc(STOPS[1], STOPS[2], (f - 0.5) * 2);
    } else { col = mixc(STOPS[0], STOPS[0], 0); }
    document.body.style.backgroundColor = col;
    sections.forEach(function (s) { s.el.style.backgroundColor = col; });
  }

  /* copy choreography shared with keyframes mode */
  function driveCopy() {
    // reveals keyed to a single progress point
    sections.forEach(function (s) {
      s.el.querySelectorAll('.reveal[data-at]').forEach(function (el) {
        var at = parseFloat(el.getAttribute('data-at'));
        el.classList.toggle('is-on', s.progress >= at);
      });
      s.el.querySelectorAll('[data-window]').forEach(function (el) {
        var w = el.getAttribute('data-window').split(',');
        var a = parseFloat(w[0]), b = parseFloat(w[1]);
        el.classList.toggle('is-on', s.progress >= a && s.progress <= b);
      });
    });
    // formation meter
    var fp = sections[1].progress;
    var fill = document.getElementById('meterFill');
    if (fill) { fill.style.height = (fp * 100).toFixed(1) + '%'; }
    document.querySelectorAll('.meter__stage').forEach(function (el, i) {
      var lo = i / 3, hi = (i + 1) / 3;
      el.classList.toggle('is-active', fp >= lo && (fp < hi || (i === 2 && fp >= lo)));
    });
    syncBackground();
  }

  /* main loop */
  function raf(time) {
    if (lenis) { lenis.raf(time); }
    var vh = window.innerHeight;
    var repro = false;
    sections.forEach(function (s, si) {
      var rect = s.el.getBoundingClientRect();
      var span = s.el.offsetHeight - vh;
      var p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      s.progress = p;
      var target = p * (FRAME_COUNT - 1);
      // interpolated scrub: ease the playhead toward the scroll target
      s.smooth += (target - s.smooth) * 0.18;
      if (Math.abs(target - s.smooth) < 0.5) { s.smooth = target; }
      var idx = Math.round(s.smooth);
      var visible = rect.top < vh && rect.bottom > 0;
      if (visible && (idx !== s.shown || s.shown === -2)) {
        if (paint(s, idx)) {
          s.shown = idx;
          if (si === 0 && !firstPaintDone) { firstPaintDone = true; updateLoader(); }
        }
      }
      if (visible && si !== activeChapter && p > 0 && p < 1) { activeChapter = si; repro = true; }
      if (si === activeChapter) { activeFrame = idx; }
    });
    if (repro) { pump(); }
    driveCopy();
    window.requestAnimationFrame(raf);
  }
  window.requestAnimationFrame(raf);

  wireImageFallbacks();
  wireProductReveal();

  /* ---------------- helpers ---------------- */
  function wireProductReveal() {
    var img = document.getElementById('productRender');
    if (!img) { return; }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { img.classList.add('is-on'); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(img);
    } else { img.classList.add('is-on'); }
  }
  function wireImageFallbacks() {
    // Remote product imagery lives on the Shopify CDN; degrade quietly if unreachable.
    ['productRender'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('error', function () { el.classList.add('is-missing'); }); }
    });
    var lab = document.querySelector('.facts__lab');
    if (lab) { lab.addEventListener('error', function () { lab.classList.add('is-missing'); }); }
  }
})();
