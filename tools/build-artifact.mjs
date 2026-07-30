// Assembles the self-contained artifact version of the scroll cinematic:
// 60 keyframes + fonts inlined as data URIs, no external requests.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = '/home/user/alphacell-creatine-collagen-site';
const b64 = p => readFileSync(join(root, p)).toString('base64');
const jpg = p => 'data:image/jpeg;base64,' + b64(p);
const woff = p => 'data:font/woff2;base64,' + b64(p);

const CH = ['elements', 'formation', 'ritual'];
const KEYS = {};
for (const c of CH) {
  KEYS[c] = [];
  for (let i = 1; i <= 20; i++) KEYS[c].push(jpg(`frames/mobile/${c}/key_${String(i).padStart(2, '0')}.jpg`));
}

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Built From Within — Alphacell Creatine &amp; Collagen</title>
<style>
@font-face{font-family:'Manrope';font-weight:300;font-display:swap;src:url('${woff('fonts/manrope-latin-300-normal.woff2')}') format('woff2');}
@font-face{font-family:'Manrope';font-weight:500;font-display:swap;src:url('${woff('fonts/manrope-latin-500-normal.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:400;font-display:swap;src:url('${woff('fonts/inter-latin-400-normal.woff2')}') format('woff2');}
:root{
  --obsidian:#171A1D;--bone:#E9EDEA;--bone-dim:rgba(233,237,234,.62);--bone-faint:rgba(233,237,234,.38);
  --azure:#2892D0;--yellow:#FDD632;--hairline:rgba(233,237,234,.14);
  --display:'Manrope',system-ui,sans-serif;--body:'Inter',system-ui,sans-serif;
  --mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  color-scheme:dark; /* a committed dark cinematic world — both theme toggles keep it */
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--obsidian);color:var(--bone);font-family:var(--body);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%}
.display{font-family:var(--display);font-weight:300;font-size:clamp(2.4rem,7vw,6rem);letter-spacing:.02em;line-height:1.05;text-wrap:balance}
.display-sm{font-family:var(--display);font-weight:300;font-size:clamp(1.8rem,4vw,3rem);letter-spacing:.02em;line-height:1.12;text-wrap:balance}
.overline{font-weight:400;font-size:.72rem;letter-spacing:.42em;color:var(--bone-dim)}
.mono{font-family:var(--mono);font-size:.95em}
.masthead{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;justify-content:space-between;align-items:center;padding:1.3rem clamp(1.2rem,4vw,3rem);mix-blend-mode:difference}
.masthead p{font-family:var(--display);font-weight:500;letter-spacing:.5em;font-size:.8rem}
.masthead a{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;text-decoration:none;color:var(--bone);border-bottom:1px solid var(--hairline);padding-bottom:.15rem}
.chapter{position:relative;height:340vh;background:var(--obsidian)}
.chapter--long{height:420vh}
.pin{position:sticky;top:0;height:100vh;overflow:hidden}
canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.hero-copy{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 1.5rem;pointer-events:none}
.hero-copy .display{margin:1.4rem 0 1.1rem}
.hero-copy p.sub{max-width:34rem;color:var(--bone-dim)}
.cue{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);font-size:.6rem;letter-spacing:.5em;color:var(--bone-faint)}
.cue::after{content:'';display:block;width:1px;height:2.4rem;margin:.6rem auto 0;background:linear-gradient(var(--bone-faint),transparent)}
.reveal{opacity:0;transform:translateY(1.2rem);transition:opacity 1s ease,transform 1s ease}
.reveal.on{opacity:1;transform:none}
.meter{position:absolute;right:clamp(1rem,4vw,3.2rem);top:50%;transform:translateY(-50%);display:flex;gap:1.3rem}
.meter .track{width:1px;background:var(--hairline);position:relative}
.meter .fill{position:absolute;top:0;left:0;width:1px;height:0%;background:var(--azure)}
.meter ol{list-style:none;display:flex;flex-direction:column;gap:2.2rem}
.meter li{opacity:.28;transition:opacity .5s;max-width:12rem;display:grid;gap:.15rem}
.meter li.on{opacity:1}
.meter .n{font-family:var(--mono);font-size:.6rem;color:var(--azure);letter-spacing:.3em}
.meter .name{font-family:var(--display);font-weight:500;font-size:.8rem;letter-spacing:.22em}
.meter .dose{font-family:var(--mono);font-size:.76rem;color:var(--bone-dim)}
.meter .line{font-size:.76rem;color:var(--bone-dim);line-height:1.5}
.callout{position:absolute;font-family:var(--mono);font-size:.64rem;letter-spacing:.3em;color:var(--bone-dim);opacity:0;transition:opacity .6s;display:flex;align-items:center;gap:.8rem}
.callout.on{opacity:1}
.callout i{display:inline-block;width:4.2rem;height:1px;background:var(--azure);opacity:.65}
.c1{left:8%;top:26%}.c2{left:12%;top:58%}.c3{left:7%;top:76%}
.ritual{position:absolute;left:clamp(1.5rem,7vw,6rem);top:18%;max-width:30rem;pointer-events:none}
.ritual .display{font-size:clamp(2rem,5vw,4.2rem)}
.ritual .sub{margin-top:1.1rem;color:var(--bone-dim)}
.ritual .doc{margin-top:1.5rem;color:var(--bone-faint);font-size:.9rem;font-style:italic;max-width:24rem}
.panel{background:#000;padding:clamp(4rem,12vh,8rem) clamp(1.5rem,6vw,5rem)}
.panel .inner{max-width:52rem;margin:0 auto}
.product-card{max-width:30rem;margin:0 auto;text-align:center;border:1px solid var(--hairline);padding:3.4rem 2rem;display:grid;gap:.8rem}
.product-card .tub{width:110px;height:130px;margin:0 auto 1.4rem;border:1px solid var(--hairline);border-radius:10px;position:relative;background:linear-gradient(105deg,#0a0c0e,#1c2024 22%,#111417 50%,#1e2226 84%,#080a0c)}
.product-card .tub::before{content:'';position:absolute;top:-12px;left:-4px;right:-4px;height:14px;border-radius:4px;background:linear-gradient(105deg,#060708,#222629 25%,#141719 55%,#262a2e 85%,#050607)}
.product-card .tub::after{content:'';position:absolute;left:8%;right:8%;top:32%;height:44%;background:rgba(233,237,234,.05)}
.formula-grid{border-top:1px solid var(--hairline);margin-top:3rem}
.frow{display:grid;grid-template-columns:minmax(10rem,15rem) 1fr;gap:1.4rem;padding:1.4rem 0;border-bottom:1px solid var(--hairline)}
.frow dt{font-family:var(--display);font-weight:500;font-size:.88rem;letter-spacing:.08em}
.frow dd .mono{display:block}
.frow .note{display:block;margin-top:.45rem;font-size:.84rem;color:var(--bone-dim);max-width:32rem}
.people{background:#000;text-align:center;padding:clamp(5rem,15vh,10rem) clamp(1.5rem,6vw,5rem)}
.people p{font-family:var(--display);font-weight:300;font-size:clamp(1.4rem,3vw,2.2rem);line-height:1.4;max-width:44rem;margin:0 auto;text-wrap:balance}
.cta{background:#000;padding:clamp(4rem,13vh,9rem) clamp(1.5rem,6vw,5rem) 3rem;text-align:center}
.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1px;background:var(--hairline);border:1px solid var(--hairline);max-width:56rem;margin:3rem auto 1.5rem}
.pcard{background:#000;padding:1.7rem 1.1rem}
.pcard .q{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--bone-dim)}
.pcard .p{font-family:var(--mono);font-size:1.4rem;margin:.6rem 0 .3rem}
.pcard .m{font-size:.76rem;color:var(--bone-faint)}
.cta .sub{font-size:.85rem;color:var(--bone-dim);max-width:34rem;margin:0 auto}
.actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin:2.6rem 0 3.6rem}
.btn{display:inline-block;padding:1rem 2.1rem;text-decoration:none;font-family:var(--display);font-weight:500;font-size:.76rem;letter-spacing:.26em;transition:background .25s,color .25s,border-color .25s}
.btn.primary{background:var(--azure);color:#04121C}
.btn.primary:hover,.btn.primary:focus-visible{background:var(--yellow);color:#151204}
.btn.ghost{border:1px solid var(--hairline);color:var(--bone)}
.btn.ghost:hover,.btn.ghost:focus-visible{border-color:var(--bone)}
.legal{border-top:1px solid var(--hairline);padding-top:2rem;text-align:left;max-width:56rem;margin:0 auto}
.legal p{font-size:.73rem;color:var(--bone-faint);max-width:46rem;margin-bottom:.85rem}
.legal a{color:var(--bone-dim)}
a:focus-visible,summary:focus-visible{outline:2px solid var(--azure);outline-offset:3px}
@media(max-width:760px){.callout{display:none}.meter{top:auto;bottom:1.3rem;transform:none;left:1.1rem;right:1.1rem}.meter .track{display:none}.meter ol{flex-direction:row;gap:.9rem;width:100%;justify-content:space-between}.meter .line{display:none}.meter .name{font-size:.58rem;letter-spacing:.12em}.frow{grid-template-columns:1fr;gap:.3rem}}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .chapter,.chapter--long{height:auto}.pin{position:relative}
}
</style>

<header class="masthead"><p>ALPHACELL</p><a href="https://alphacell-labs.com/products/alphacell-creatine-collagen-300-g-10-58-oz-30-servings">Shop</a></header>

<section class="chapter" id="ch0" aria-label="The elements">
  <div class="pin">
    <canvas aria-hidden="true"></canvas>
    <div class="hero-copy">
      <p class="overline reveal" data-at="0.03">ALPHACELL PRESENTS</p>
      <h1 class="display reveal" data-at="0.08">BUILT FROM&nbsp;WITHIN.</h1>
      <p class="sub reveal" data-at="0.16">Creatine and collagen. Two foundations brought together in one daily formula.</p>
      <p class="cue reveal" data-at="0.2" aria-hidden="true">SCROLL</p>
    </div>
  </div>
</section>

<section class="chapter chapter--long" id="ch1" aria-label="The formation">
  <div class="pin">
    <canvas aria-hidden="true"></canvas>
    <div class="meter" role="group" aria-label="Formula stages">
      <div class="track" aria-hidden="true"><div class="fill" id="fill"></div></div>
      <ol>
        <li><span class="n">01</span><span class="name">CREATINE</span><span class="dose">5&nbsp;g</span><span class="line">Power for repeated effort.</span></li>
        <li><span class="n">02</span><span class="name">COLLAGEN</span><span class="dose">5&nbsp;g</span><span class="line">Structure that supports movement.</span></li>
        <li><span class="n">03</span><span class="name">ONE DAILY FORMULA</span><span class="dose">10&nbsp;g scoop</span><span class="line">Built to become part of the routine.</span></li>
      </ol>
    </div>
    <p class="callout c1" data-w="0.28,0.52" aria-hidden="true"><i></i>CELLULAR ENERGY</p>
    <p class="callout c2" data-w="0.42,0.64" aria-hidden="true"><i></i>STRUCTURAL SUPPORT</p>
    <p class="callout c3" data-w="0.55,0.8" aria-hidden="true"><i></i>DAILY CONSISTENCY</p>
  </div>
</section>

<section class="chapter chapter--long" id="ch2" aria-label="One ritual">
  <div class="pin">
    <canvas aria-hidden="true"></canvas>
    <div class="ritual">
      <h2 class="display reveal" data-at="0.4">THE WORK IS&nbsp;DAILY.</h2>
      <p class="sub reveal" data-at="0.48">One scoop. One repeatable step. Built for the life that asks more of you.</p>
      <p class="doc reveal" data-at="0.58">You do not need a dramatic reinvention. You need something you can keep doing.</p>
    </div>
  </div>
</section>

<section class="panel" aria-label="The product">
  <div class="product-card">
    <div class="tub" aria-hidden="true"></div>
    <p class="overline">THE FORMULA</p>
    <h2 class="display-sm">Creatine&nbsp;&amp;&nbsp;Collagen</h2>
    <p style="color:var(--bone-dim);font-size:.9rem">10.58&nbsp;oz&nbsp;(300&nbsp;g) · 30 servings · Unflavored</p>
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
  <p>Strength rarely announces itself. It looks like the morning you protect, the work you return to, and the small things you choose to do again.</p>
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
    <a class="btn primary" href="https://alphacell-labs.com/products/alphacell-creatine-collagen-300-g-10-58-oz-30-servings">SHOP CREATINE &amp; COLLAGEN</a>
    <a class="btn ghost" href="#formula">SEE THE FORMULA</a>
  </div>
  <footer class="legal">
    <p>These references and statements are shared for educational purposes only. They are not medical advice, and they should not be interpreted as claims that any Alphacell Labs product will diagnose, treat, cure, or prevent any disease.</p>
    <p>For best results, formulations should be used consistently as part of a disciplined lifestyle that prioritizes sleep, movement, and nutrition. Consult a qualified healthcare professional when appropriate — especially if pregnant, nursing, taking medications, or managing a medical condition.</p>
    <p>© Alphacell Labs · <a href="https://alphacell-labs.com">alphacell-labs.com</a></p>
  </footer>
</section>

<script>
(function(){
'use strict';
var FRAMES=${JSON.stringify(KEYS)};
var CH=['elements','formation','ritual'];
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var secs=CH.map(function(_,i){
  var el=document.getElementById('ch'+i);
  return {el:el,canvas:el.querySelector('canvas'),ctx:null,imgs:[],p:0,smooth:0,painted:-1};
});
// decode all 60 keyframes (inline data URIs — instant, no network)
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
var STOPS=[[23,26,29],[13,17,20],[5,6,6],[0,0,0]];
function mix(a,b,t){return 'rgb('+Math.round(a[0]+(b[0]-a[0])*t)+','+Math.round(a[1]+(b[1]-a[1])*t)+','+Math.round(a[2]+(b[2]-a[2])*t)+')';}
function loop(){
  var vh=innerHeight;
  secs.forEach(function(s){
    var r=s.el.getBoundingClientRect(),span=s.el.offsetHeight-vh;
    var p=span>0?Math.min(1,Math.max(0,-r.top/span)):0;s.p=p;
    var target=p*19;
    s.smooth+= (target-s.smooth)*(reduced?1:0.16);
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
  var fp=secs[1].p,rp=secs[2].p,col;
  if(rp>0)col=mix(STOPS[2],STOPS[3],Math.min(1,rp*2.2));
  else if(fp>0)col=fp<0.5?mix(STOPS[0],STOPS[1],fp*2):mix(STOPS[1],STOPS[2],(fp-0.5)*2);
  else col='rgb(23,26,29)';
  document.body.style.backgroundColor=col;
  secs.forEach(function(s){s.el.style.backgroundColor=col;});
  var fill=document.getElementById('fill');
  if(fill)fill.style.height=(fp*100).toFixed(1)+'%';
  document.querySelectorAll('.meter li').forEach(function(el,i){
    el.classList.toggle('on',fp>=i/3&&(fp<(i+1)/3||i===2));
  });
  requestAnimationFrame(loop);
}
if(reduced){
  document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('on');});
  document.querySelectorAll('.meter li,.callout').forEach(function(e){e.classList.add('on');});
  secs.forEach(function(s,i){var im=s.imgs[10];im.onload=function(){draw(s,10);};if(im.complete)draw(s,10);});
}else{
  requestAnimationFrame(loop);
}
})();
</script>`;

writeFileSync(join(root, 'tools', 'artifact.html'), html);
console.log('artifact.html bytes:', html.length);
