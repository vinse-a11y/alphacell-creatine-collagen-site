# Built From Within — Alphacell Creatine & Collagen scroll cinematic

A one-page scroll-driven cinematic for the Alphacell **Creatine & Collagen**
daily formula (5 g creatine monohydrate + 5 g grass-fed bovine collagen per
10 g scoop, 30 servings, unflavored).

## How it works

- **No WebGL, no live 3D.** Three pre-rendered image sequences
  (`frames/elements|formation|ritual`, 150 frames each at 1600×900) are
  scrubbed on full-viewport canvases mapped to scroll position, with
  interpolated playback and frame-change-only repainting.
- [Lenis](https://lenis.darkroom.engineering/) (CDN with local fallback)
  provides smooth scrolling; it is disabled for reduced motion.
- The preloader reports true critical-asset progress (fonts + first-chapter
  frames + first canvas paint) before unlocking scroll.
- Narrow screens load a 20-keyframe set per chapter (`frames/mobile/*`)
  instead of the 450 desktop frames. Reduced-motion visitors get static
  keyframes with all copy and product information intact.
- Product facts, pricing, subscription plans, description language, and the
  heavy-metals lab summary come from the live Alphacell Labs Shopify store —
  nothing is invented.

## Tooling

- `node tools/render-frames.mjs sample|full` — regenerates the cinematic
  frames deterministically (Playwright + `tools/renderer.html`).
- `node tools/verify.mjs` — serves the site and drives desktop / tablet /
  mobile / reduced-motion checks end to end.

Deployed via GitHub Pages (`.github/workflows/deploy-pages.yml`).
