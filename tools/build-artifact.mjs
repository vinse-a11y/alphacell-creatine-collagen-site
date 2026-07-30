// Assembles the self-contained artifact version of THE DESCENT:
// 60 keyframes + fonts inlined as data URIs, so the page makes no external requests.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = '/home/user/alphacell-creatine-collagen-site';
const b64 = p => readFileSync(join(root, p)).toString('base64');
const jpg = p => 'data:image/jpeg;base64,' + b64(p);
const woff = p => 'data:font/woff2;base64,' + b64(p);

const CH = ['drop', 'descent', 'deep'];
const KEYS = {};
for (const c of CH) {
  KEYS[c] = [];
  for (let i = 1; i <= 20; i++) KEYS[c].push(jpg(`frames/mobile/${c}/key_${String(i).padStart(2, '0')}.jpg`));
}
const SHOP = 'https://alphacell-labs.com/products/alphacell-creatine-collagen-300-g-10-58-oz-30-servings';

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Built From Within — Alphacell Creatine + Collagen</title>
<style>
@font-face{font-family:'Manrope';font-weight:300;font-display:swap;src:url('${woff('fonts/manrope-latin-300-normal.woff2')}') format('woff2');}
@font-face{font-family:'Manrope';font-weight:500;font-display:swap;src:url('${woff('fonts/manrope-latin-500-normal.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:400;font-display:swap;src:url('${woff('fonts/inter-latin-400-normal.woff2')}') format('woff2');}
:root{
  --sunlit:#0B3F58;--bone:#E9EDEA;--bone-dim:rgba(233,237,234,.62);--bone-faint:rgba(233,237,234,.38);
  --azure:#2892D0;--yellow:#FDD632;--hairline:rgba(233,237,234,.14);
  --display:'Manrope',system-ui,sans-serif;--body:'Inter',system-ui,sans-serif;
  --mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  color-scheme:dark; /* a descent into dark water commits to one world, by design */
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--sunlit);color:var(--bone);font-family:var(--body);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
.display{font-family:var(--display);font-weight:300;font-size:clamp(2.3rem,6.4vw,5.6rem);letter-spacing:.02em;line-height:1.05;text-wrap:balance}
.display-sm{font-family:var(--display);font-weight:300;font-size:clamp(1.8rem,4vw,3rem);letter-spacing:.02em;line-height:1.12;text-wrap:balance}
.overline{font-weight:400;font-size:.7rem;letter-spacing:.4em;color:var(--bone-dim)}
.mono{font-family:var(--mono);font-size:.95em}
.skip{position:fixed;top:-4rem;left:1rem;z-index:200;background:var(--bone);color:#000;padding:.6rem 1rem;text-decoration:none;font-size:.85rem;transition:top .2s}
.skip:focus{top:1rem}
.masthead{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;justify-content:space-between;align-items:center;padding:1.3rem clamp(1.2rem,4vw,3rem);mix-blend-mode:difference}
.masthead p{font-family:var(--display);font-weight:500;letter-spacing:.5em;font-size:.8rem}
.masthead a{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;text-decoration:none;color:var(--bone);border-bottom:1px solid var(--hairline);padding-bottom:.15rem}
.chapter{position:relative;height:360vh;background:var(--sunlit)}
.chapter--long{height:440vh}
.pin{position:sticky;top:0;height:100vh;overflow:hidden}
canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.hero-copy{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:0 1.5rem 17vh;pointer-events:none}
.hero-copy .display{margin:1.1rem 0 1rem}
.hero-copy p.sub{max-width:34rem;color:var(--bone-dim)}
.cue{position:absolute;bottom:1.6rem;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:.6rem;letter-spacing:.5em;color:var(--bone-faint)}
.cue::after{content:'';display:block;width:1px;height:2rem;margin:.6rem auto 0;background:linear-gradient(var(--bone-faint),transparent)}
.reveal{opacity:0;transform:translateY(1.2rem);transition:opacity 1s ease,transform 1s ease}
.reveal.on{opacity:1;transform:none}

.gauge{position:absolute;right:clamp(1.2rem,4vw,3.4rem);top:clamp(5.5rem,12vh,8rem);text-align:right;display:grid;gap:.5rem;justify-items:end}
.gauge .lab{font-family:var(--mono);font-size:.6rem;letter-spacing:.4em;color:var(--bone-faint)}
.gauge .val{font-family:var(--mono);font-size:clamp(2.2rem,5vw,3.8rem);line-height:1;font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:.4rem}
.gauge .of{font-size:.3em;letter-spacing:.2em;color:var(--bone-faint)}
.gauge .track{width:clamp(6rem,12vw,11rem);height:1px;background:var(--hairline);position:relative}
.gauge .fill{position:absolute;inset:0 auto 0 0;width:0%;background:var(--azure)}
.gauge .note{font-family:var(--mono);font-size:.6rem;letter-spacing:.16em;color:var(--bone-faint)}

.stations{position:absolute;left:clamp(1.5rem,6vw,5rem);top:0;height:100%;width:min(26rem,42vw);list-style:none;display:flex;align-items:center;pointer-events:none}
.station{position:absolute;display:grid;gap:.5rem;opacity:0;transform:translateY(1.4rem);transition:opacity .9s ease,transform .9s ease}
.station.on{opacity:1;transform:none}
.station .rule{display:block;width:3.4rem;height:1px;background:var(--azure)}
.station .mark{font-family:var(--mono);font-size:.66rem;letter-spacing:.32em;color:var(--azure)}
.station .head{font-family:var(--display);font-weight:300;font-size:clamp(1.5rem,2.6vw,2.2rem);line-height:1.15}
.station .body{font-size:.88rem;color:var(--bone-dim);max-width:24rem}

.deep-copy{position:absolute;right:clamp(1.5rem,7vw,6rem);top:22%;max-width:30rem;text-align:right;pointer-events:none}
.deep-copy .display{font-size:clamp(2rem,5vw,4.2rem)}
.deep-copy .sub{margin:1.1rem 0 0 auto;color:var(--bone-dim);max-width:26rem}
.deep-copy .doc{margin:1.5rem 0 0 auto;color:var(--bone-faint);font-size:.9rem;font-style:italic;max-width:24rem}

.panel{background:#000;padding:clamp(4rem,12vh,8rem) clamp(1.5rem,6vw,5rem)}
.panel .inner{max-width:52rem;margin:0 auto}
.formula-grid{border-top:1px solid var(--hairline);margin-top:3rem}
.frow{display:grid;grid-template-columns:minmax(10rem,15rem) 1fr;gap:1.4rem;padding:1.4rem 0;border-bottom:1px solid var(--hairline)}
.frow dt{font-family:var(--display);font-weight:500;font-size:.88rem;letter-spacing:.08em}
.frow dd .mono{display:block}
.frow .note{display:block;margin-top:.45rem;font-size:.84rem;color:var(--bone-dim);max-width:32rem}
.people{background:#000;text-align:center;padding:clamp(5rem,15vh,10rem) clamp(1.5rem,6vw,5rem)}
.people blockquote p{font-family:var(--display);font-weight:300;font-size:clamp(1.4rem,3vw,2.2rem);line-height:1.4;max-width:44rem;margin:0 auto;text-wrap:balance}
.cta{background:#000;padding:clamp(4rem,13vh,9rem) clamp(1.5rem,6vw,5rem) 3rem;text-align:center}
.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1px;background:var(--hairline);border:1px solid var(--hairline);max-width:56rem;margin:3rem auto 1.5rem}
.pcard{background:#000;padding:1.7rem 1.1rem}
.pcard .q{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--bone-dim)}
.pcard .p{font-family:var(--mono);font-size:1.4rem;margin:.6rem 0 .3rem}
.pcard .m{font-size:.76rem;color:var(--bone-faint)}
.cta .sub{font-size:.85rem;color:var(--bone-dim);max-width:34rem;margin:0 auto}
.actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin:2.6rem 0 3rem}
.btn{display:inline-block;padding:1rem 2.1rem;text-decoration:none;font-family:var(--display);font-weight:500;font-size:.76rem;letter-spacing:.26em;transition:background .25s,color .25s,border-color .25s}
.btn.primary{background:var(--azure);color:#04121C}
.btn.primary:hover,.btn.primary:focus-visible{background:var(--yellow);color:#151204}
.btn.ghost{border:1px solid var(--hairline);color:var(--bone);background:transparent;cursor:pointer}
.btn.ghost:hover,.btn.ghost:focus-visible{border-color:var(--bone)}
.signup{max-width:34rem;margin:0 auto 3.6rem;text-align:left;display:grid;gap:.7rem}
.signup label{font-family:var(--mono);font-size:.66rem;letter-spacing:.28em;text-transform:uppercase;color:var(--bone-dim)}
.signup .row{display:flex;gap:.6rem;flex-wrap:wrap}
.signup input{flex:1 1 14rem;background:transparent;border:1px solid var(--hairline);color:var(--bone);font-family:var(--body);font-size:.95rem;padding:.95rem 1rem}
.signup input::placeholder{color:var(--bone-faint)}
.signup .fine{font-size:.72rem;color:var(--bone-faint)}
.legal{border-top:1px solid var(--hairline);padding-top:2rem;text-align:left;max-width:56rem;margin:0 auto}
.legal p{font-size:.73rem;color:var(--bone-faint);max-width:46rem;margin-bottom:.85rem}
.legal a{color:var(--bone-dim)}
a:focus-visible,summary:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--azure);outline-offset:3px}
@media(max-width:900px){.gauge{right:1rem;top:5rem}.stations{width:min(22rem,64vw)}}
@media(max-width:640px){
  .hero-copy{padding-bottom:12vh}
  .gauge{top:auto;bottom:1.2rem;right:1.2rem;gap:.3rem}.gauge .val{font-size:1.9rem}.gauge .track{width:5rem}
  .stations{width:calc(100% - 2.4rem);left:1.2rem;align-items:flex-start;padding-top:22vh}
  .station .head{font-size:1.35rem}.station .body{font-size:.8rem;max-width:none}
  .deep-copy{top:16%;left:1.2rem;right:1.2rem;text-align:left}
  .deep-copy .sub,.deep-copy .doc{margin-left:0}
  .frow{grid-template-columns:1fr;gap:.3rem}
}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .station{opacity:1;transform:none;transition:none;position:static}
  .stations{position:static;height:auto;display:grid;gap:2rem;width:100%;align-items:start}
  .chapter,.chapter--long{height:auto}.pin{position:relative}
}
</style>

<a class="skip" href="#formula">Skip to product information</a>
<header class="masthead"><p>ALPHACELL</p><a href="${SHOP}">Shop</a></header>

<main>
<section class="chapter" id="ch0" aria-label="The drop">
  <div class="pin">
    <canvas aria-hidden="true"></canvas>
    <div class="hero-copy">
      <p class="overline reveal" data-at="0.03">ALPHACELL LABS · CREATINE + COLLAGEN</p>
      <h1 class="display reveal" data-at="0.08">BUILT FROM&nbsp;WITHIN.</h1>
      <p class="sub reveal" data-at="0.16">Creatine and collagen. Two foundations brought together in one daily formula.</p>
      <p class="cue reveal" data-at="0.24" aria-hidden="true">SCROLL TO DESCEND</p>
    </div>
  </div>
</section>

<section class="chapter chapter--long" id="ch1" aria-label="The descent">
  <div class="pin">
    <canvas aria-hidden="true"></canvas>
    <div class="gauge" role="group" aria-label="Container progress">
      <p class="lab">SERVING</p>
      <p class="val"><span id="gnum">01</span><span class="of">/ 30</span></p>
      <div class="track" aria-hidden="true"><div class="fill" id="gfill"></div></div>
      <p class="note">10&nbsp;g scoop · 300&nbsp;g container</p>
    </div>
    <ol class="stations" aria-label="What consistent daily use looks like">
      <li class="station" data-w="0.06,0.34">
        <span class="rule" aria-hidden="true"></span><span class="mark">DAY 1–3</span>
        <span class="head">Setting the routine</span>
        <span class="body">One scoop daily, mixed into water, smoothies, or shakes. This phase is about establishing the habit, not chasing immediate changes.</span>
      </li>
      <li class="station" data-w="0.30,0.58">
        <span class="rule" aria-hidden="true"></span><span class="mark">WEEK 1–2</span>
        <span class="head">A steady baseline</span>
        <span class="body">Creatine monohydrate — 5&nbsp;g — is widely used to support strength output and workout performance. Collagen supports the structural tissues involved in movement and recovery.</span>
      </li>
      <li class="station" data-w="0.54,0.80">
        <span class="rule" aria-hidden="true"></span><span class="mark">WEEK 3–4</span>
        <span class="head">Consistency compounds</span>
        <span class="body">Continued routine use supports the consistency that drives progress — showing up for training and recovery habits with fewer missed days.</span>
      </li>
      <li class="station" data-w="0.76,1.0">
        <span class="rule" aria-hidden="true"></span><span class="mark">MONTH 1+</span>
        <span class="head">Still going</span>
        <span class="body">A clean daily habit, without stimulants, flavours, or unnecessary additives. Supporting training output while reinforcing the tissues that make movement feel durable.</span>
      </li>
    </ol>
  </div>
</section>

<section class="chapter chapter--long" id="ch2" aria-label="The deep">
  <div class="pin">
    <canvas aria-hidden="true"></canvas>
    <div class="deep-copy">
      <h2 class="display reveal" data-at="0.34">NOTHING&nbsp;ELSE IN&nbsp;IT.</h2>
      <p class="sub reveal" data-at="0.44">Five grams of creatine monohydrate. Five grams of grass-fed bovine collagen. Unflavored. No other ingredients.</p>
      <p class="doc reveal" data-at="0.56">You do not need a dramatic reinvention. You need something you can keep doing.</p>
    </div>
  </div>
</section>

<section class="panel" id="formula" aria-label="Formula details">
  <div class="inner">
    <p class="overline">WHAT IS INSIDE</p>
    <h2 class="display-sm" style="margin:1rem 0 0">One scoop. Two foundations. Nothing&nbsp;else.</h2>
    <dl class="formula-grid">
      <div class="frow"><dt>Creatine Monohydrate</dt><dd><span class="mono">5 g</span><span class="note">Widely studied for its role in supporting high-intensity performance and strength output by helping replenish cellular energy during short bursts of effort.</span></dd></div>
      <div class="frow"><dt>Grass-Fed Bovine Collagen</dt><dd><span class="mono">5 g</span><span class="note">Included to support the body’s connective tissues — helping provide the foundational building blocks involved in joint, tendon, ligament, and skin support.</span></dd></div>
      <div class="frow"><dt>Other ingredients</dt><dd><span class="mono">None</span></dd></div>
      <div class="frow"><dt>Serving size</dt><dd><span class="mono">1 scoop / 10 g</span></dd></div>
      <div class="frow"><dt>Servings per container</dt><dd><span class="mono">30</span></dd></div>
      <div class="frow"><dt>Flavour</dt><dd><span class="mono">Unflavored</span><span class="note">Mix-anywhere format: water, smoothies, or shakes.</span></dd></div>
      <div class="frow"><dt>Daily use</dt><dd><span class="mono">1 scoop daily</span><span class="note">Designed for consistent daily use — foundational support rather than short-term stimulation.</span></dd></div>
      <div class="frow"><dt>Testing</dt><dd><span class="mono">Heavy metals — lab summary</span><span class="note">A third-party heavy-metals lab summary is published on the product page.</span></dd></div>
    </dl>
  </div>
</section>

<section class="people" aria-label="The people building">
  <blockquote><p>Strength rarely announces itself. It looks like the morning you protect, the work you return to, and the small things you choose to do again.</p></blockquote>
  <a class="btn ghost" style="margin-top:2.4rem" href="https://www.youtube.com/watch?v=g9e3AbIbM08">MEET THE PEOPLE BUILDING SOMETHING →</a>
</section>

<section class="cta" aria-label="Shop">
  <h2 class="display">BUILD IT&nbsp;DAILY.</h2>
  <div class="pricing">
    <div class="pcard"><p class="q">1 Tub</p><p class="p">A$48.50</p><p class="m">300 g · 30 servings</p></div>
    <div class="pcard"><p class="q">3 Tubs</p><p class="p">A$103.00</p><p class="m">90 servings</p></div>
    <div class="pcard"><p class="q">6 Tubs</p><p class="p">A$195.00</p><p class="m">180 servings</p></div>
  </div>
  <p class="sub">Subscription options — ships monthly (save 10%), every 3&nbsp;months (save 5%), or every 12&nbsp;months (save 2%).</p>
  <div class="actions">
    <a class="btn primary" href="${SHOP}">SHOP CREATINE + COLLAGEN</a>
    <a class="btn ghost" href="#formula">SEE THE FORMULA</a>
  </div>
  <form class="signup" action="https://alphacell-labs.com/contact#contact_form" method="post" accept-charset="UTF-8">
    <input type="hidden" name="form_type" value="customer">
    <input type="hidden" name="utf8" value="✓">
    <input type="hidden" name="contact[tags]" value="newsletter">
    <label for="em">Get restock and formulation updates</label>
    <div class="row">
      <input id="em" type="email" name="contact[email]" autocomplete="email" required placeholder="you@example.com">
      <button class="btn ghost" type="submit">NOTIFY ME</button>
    </div>
    <p class="fine">Submits to the Alphacell Labs store. Unsubscribe any time.</p>
  </form>
  <footer class="legal">
    <p>These references and statements are shared for educational purposes only. They are not medical advice, and they should not be interpreted as claims that any Alphacell Labs product will diagnose, treat, cure, or prevent any disease.</p>
    <p>For best results, formulations should be used consistently as part of a disciplined lifestyle that prioritizes sleep, movement, and nutrition. Consult a qualified healthcare professional when appropriate — especially if pregnant, nursing, taking medications, or managing a medical condition.</p>
    <p>© Alphacell Labs · <a href="https://alphacell-labs.com">alphacell-labs.com</a></p>
  </footer>
</section>
</main>

<script>
(function(){
'use strict';
var FRAMES=${JSON.stringify(KEYS)};
var CH=['drop','descent','deep'];
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var secs=CH.map(function(_,i){
  var el=document.getElementById('ch'+i);
  return {el:el,canvas:el.querySelector('canvas'),ctx:null,imgs:[],p:0,smooth:0,painted:-1};
});
secs.forEach(function(s,i){
  FRAMES[CH[i]].forEach(function(src){var im=new Image();im.src=src;s.imgs.push(im);});
});
var W=960,H=540;
function size(){
  var dpr=Math.min(2,devicePixelRatio||1);
  secs.forEach(function(s){
    s.canvas.width=Math.round(s.canvas.clientWidth*dpr);
    s.canvas.height=Math.round(s.canvas.clientHeight*dpr);
    s.ctx=s.canvas.getContext('2d');s.painted=-1;
  });
}
addEventListener('resize',size);size();
function draw(s,f){
  var i=Math.max(0,Math.min(18,Math.floor(f))),t=f-i;
  var a=s.imgs[i],b=s.imgs[i+1]||a,ctx=s.ctx;
  if(!a.complete||!ctx)return;
  var cw=s.canvas.width,ch=s.canvas.height,sc=Math.max(cw/W,ch/H),dw=W*sc,dh=H*sc;
  ctx.globalAlpha=1;ctx.drawImage(a,(cw-dw)/2,(ch-dh)/2,dw,dh);
  if(b.complete&&t>0.02){ctx.globalAlpha=t;ctx.drawImage(b,(cw-dw)/2,(ch-dh)/2,dw,dh);ctx.globalAlpha=1;}
}
/* page ground follows the water, matching the film */
var WATER=[[0,[11,63,88]],[0.26,[11,42,62]],[0.55,[16,30,42]],[0.80,[7,9,11]],[1,[0,0,0]]];
function depthAt(T){ if(T<1)return T*0.17; if(T<2)return 0.17+(T-1)*0.75; return 0.92+(T-2)*0.08; }
function rampAt(d){
  for(var i=0;i<WATER.length-1;i++){
    var a=WATER[i],b=WATER[i+1];
    if(d<=b[0]){var t=(d-a[0])/(b[0]-a[0]);
      return 'rgb('+Math.round(a[1][0]+(b[1][0]-a[1][0])*t)+','+Math.round(a[1][1]+(b[1][1]-a[1][1])*t)+','+Math.round(a[1][2]+(b[1][2]-a[1][2])*t)+')';}
  }
  return 'rgb(0,0,0)';
}
function loop(){
  var vh=innerHeight;
  secs.forEach(function(s){
    var r=s.el.getBoundingClientRect(),span=s.el.offsetHeight-vh;
    var p=span>0?Math.min(1,Math.max(0,-r.top/span)):0;s.p=p;
    var target=p*19;
    s.smooth+=(target-s.smooth)*(reduced?1:0.16);
    if(Math.abs(target-s.smooth)<0.003)s.smooth=target;
    if(r.top<vh&&r.bottom>0){
      var key=Math.round(s.smooth*100);
      if(key!==s.painted){draw(s,s.smooth);s.painted=key;}
    }
    s.el.querySelectorAll('.reveal[data-at]').forEach(function(el){
      el.classList.toggle('on',p>=parseFloat(el.getAttribute('data-at')));
    });
    s.el.querySelectorAll('[data-w]').forEach(function(el){
      var w=el.getAttribute('data-w').split(',');
      el.classList.toggle('on',p>=+w[0]&&p<=+w[1]);
    });
  });
  var T=secs[0].p+secs[1].p+secs[2].p;
  var col=rampAt(depthAt(Math.min(2.999,T)));
  document.body.style.backgroundColor=col;
  secs.forEach(function(s){s.el.style.backgroundColor=col;});
  var fp=secs[1].p;
  var serving=Math.max(1,Math.min(30,Math.round(fp*29)+1));
  var num=document.getElementById('gnum');
  var txt=serving<10?'0'+serving:String(serving);
  if(num&&num.textContent!==txt)num.textContent=txt;
  var fill=document.getElementById('gfill');
  if(fill)fill.style.width=(fp*100).toFixed(1)+'%';
  requestAnimationFrame(loop);
}
if(reduced){
  document.querySelectorAll('.reveal,.station').forEach(function(e){e.classList.add('on');});
  secs.forEach(function(s){var im=s.imgs[10];im.onload=function(){draw(s,10);};if(im.complete)draw(s,10);});
}else{
  requestAnimationFrame(loop);
}
})();
</script>`;

writeFileSync(join(root, 'tools', 'artifact.html'), html);
console.log('artifact.html bytes:', html.length);
