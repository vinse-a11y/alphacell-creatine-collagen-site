# Built From Within — Alphacell Creatine + Collagen

A one-page scroll cinematic for the Alphacell Labs **Creatine + Collagen** daily
formula: 5 g creatine monohydrate + 5 g grass-fed bovine collagen per 10 g scoop,
30 servings, unflavored, no other ingredients.

## The concept: DESCENT

The container breaks a sunlit, rippled water surface and sinks. As the visitor
scrolls it falls through water shading from turquoise through indigo to absolute
black, light rays thinning and going out, bubbles and marine snow rising past.
In the dark, a narrowing key beam keeps the label readable. A live gauge counts
through the container's 30 servings, and the brand's verified use timeline
surfaces at its stages.

## How it works

- **No WebGL, no live 3D.** Three pre-rendered sequences (`frames/drop`,
  `frames/descent`, `frames/deep` — 150 frames each at 1600x900) are scrubbed on
  full-viewport canvases mapped to scroll position, with interpolated playback
  and frame-change-only repainting.
- The page background interpolates through the same depth curve as the film, so
  the ground and the water darken together, reaching true black in the deep.
- [Lenis](https://lenis.darkroom.engineering/) (CDN, local fallback bundled)
  drives smooth scrolling; it is disabled for reduced motion.
- The preloader reports real critical-asset progress — fonts, the first
  chapter's frames, and the first successful canvas paint — before unlocking.
- Narrow screens load 20 keyframes per chapter (`frames/mobile/*`) instead of
  the 450 desktop frames. Reduced-motion visitors get static keyframes with all
  copy and product information intact. No-JS collapses to a readable page.
- The container in the cinematic is a vector rebuild of the real packaging,
  composited once into an offscreen bitmap and only translated, scaled and
  swayed — so the label cannot mutate between frames. The photographed product
  appears at the reveal section from the live store CDN.
- Product facts, pricing, subscription plans, claim language and the
  heavy-metals lab summary all come from the live Alphacell Labs Shopify store.

## Tooling

- `node tools/render-frames.mjs product` — preview the packaging rebuild alone.
- `node tools/render-frames.mjs sample` — art-direction stills across the descent.
- `node tools/render-frames.mjs full` — the 450 desktop frames + mobile keyframes.
- `node tools/build-artifact.mjs` — single-file build with assets inlined.
- `node tools/verify.mjs` — serves the site and drives desktop / tablet / mobile /
  reduced-motion checks end to end.
