from core import *
from sim import VENUES

ORBIT = [("Reorder", "#22C55E"), ("Shift watch", "#FF7A3D"), ("Win-back", "#F472B6"), ("Booking", "#2DD4BF"), ("Payout check", "#60A5FA"), ("Menu health", "#FBBF24")]

def home_hero():
    chips = "".join(f'<span class="orb-chip" style="--i:{i};--n:{len(ORBIT)};--c:{c}"><span><i></i>{t}</span></span>' for i, (t, c) in enumerate(ORBIT))
    venues = "".join(f'<a class="hv-chip" href="#experience" data-pick-venue="{k}">{ic(i)}<span>{t}</span></a>' for k, i, t in VENUES)
    return f'''<section class="hx" aria-labelledby="hx-h">
<div class="hx-bg" aria-hidden="true"><i class="glow g1"></i><i class="glow g2"></i></div>
<div class="wrap hx-grid">
  <div class="hx-copy">
    <span class="hx-pill"><span class="hx-dot"></span>Pioneering AI agents for restaurants in India</span>
    <h1 id="hx-h">Your restaurant, now with an <span class="hx-grad">AI team</span>.</h1>
    <p class="hx-lede">40 AI agents watch your billing, kitchen, stock and guests around the clock. They catch problems before they cost you, do the legwork, and ask before they act. Built on the platform that already runs 600+ outlets.</p>
    <div class="actions"><a class="btn btn-primary btn-lg" href="{L("demo")}">Book a demo {ARROW}</a><a class="btn hx-ghost btn-lg" href="#experience">Watch the agents work</a></div>
    <div class="hx-venues"><span>See the agents at your…</span><div>{venues}</div></div>
  </div>
  <div class="hx-stage" aria-label="Animated example of Digitory AI agents at work, with sample data">
    <div class="orb">
      <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
      <div class="orbit">{chips}</div>
      <div class="core"><span class="core-ic">{ic("spark")}</span><b>Digitory AI</b><span>40 agents · live</span></div>
    </div>
    <div class="feed" data-feed>
      <div class="feed-h"><span class="live"><i></i>Agent activity</span><span class="feed-note">Sample data</span></div>
      <ul class="feed-list"></ul>
    </div>
  </div>
</div>
<div class="wrap hx-stats">
  <div><b>600+</b><span>outlets run on Digitory</span></div><div><b>40</b><span>AI agents across 13 areas</span></div><div><b>₹1,000 Cr+</b><span>billed every year</span></div><div><b>24×7</b><span>watching, with you in charge</span></div>
</div>
</section>'''

HERO_CSS = """
/* Premium AI hero */
.hx{position:relative;overflow:hidden;background:#0B1624;color:#fff;padding-block:clamp(56px,8vw,104px) 40px;isolation:isolate}
.hx-bg{position:absolute;inset:0;z-index:-1;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse 80% 70% at 60% 40%,#000 30%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 80% 70% at 60% 40%,#000 30%,transparent 80%)}
.glow{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55}
.g1{width:560px;height:560px;right:-120px;top:-80px;background:radial-gradient(circle,#FF5A10,transparent 65%);animation:drift 12s ease-in-out infinite}
.g2{width:420px;height:420px;left:-160px;bottom:-200px;background:radial-gradient(circle,#2E4560,transparent 70%)}
@keyframes drift{50%{transform:translate(-40px,30px) scale(1.08)}}
.hx-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:clamp(36px,5vw,72px);align-items:center}
@media (max-width:980px){.hx-grid{grid-template-columns:minmax(0,1fr)}}
.hx-copy{display:flex;flex-direction:column;gap:26px}
.hx-pill{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;padding:8px 16px 8px 12px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);font-size:13.5px;font-weight:500;color:#E7EDF3;backdrop-filter:blur(8px)}
.hx-dot{width:8px;height:8px;border-radius:50%;background:#FF5A10;box-shadow:0 0 0 0 rgba(255,90,16,.7);animation:ping 2s infinite}
@keyframes ping{70%{box-shadow:0 0 0 10px rgba(255,90,16,0)}100%{box-shadow:0 0 0 0 rgba(255,90,16,0)}}
.hx h1{font-size:clamp(42px,6vw,78px);line-height:1.02;letter-spacing:-.04em;color:#fff}
.hx-grad{background:linear-gradient(92deg,#FF5A10 10%,#FF9A5C 55%,#FFC58F);-webkit-background-clip:text;background-clip:text;color:transparent}
.hx-lede{font-size:clamp(17px,1.5vw,20px);line-height:1.6;color:#B9C6D3;max-width:34em}
.btn-lg{min-height:56px;padding:0 28px;font-size:16.5px}
.hx .btn-primary{box-shadow:0 12px 30px -10px rgba(255,90,16,.7)}
.hx-ghost{background:rgba(255,255,255,.06);color:#fff;border-color:rgba(255,255,255,.22)}
.hx-ghost:hover{background:rgba(255,255,255,.12);border-color:#fff}
.hx-venues{display:flex;flex-direction:column;gap:10px}
.hx-venues>span{font-size:13px;color:#8FA2B5;font-weight:500}
.hx-venues>div{display:flex;flex-wrap:wrap;gap:8px}
.hv-chip{display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#DCE4EC;font-size:13.5px;font-weight:500;text-decoration:none;transition:all .15s}
.hv-chip svg{width:16px;height:16px;color:#FF8A4F}
.hv-chip:hover{border-color:#FF8A4F;background:rgba(255,90,16,.12);color:#fff}
/* stage */
.hx-stage{position:relative;min-height:540px;display:flex;align-items:center;justify-content:center}
.orb{position:relative;width:min(440px,92vw);aspect-ratio:1;max-width:100%}
.ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.12)}
.r1{inset:0;border-style:dashed;animation:spin 60s linear infinite}
.r2{inset:15%;border-color:rgba(255,122,61,.35);animation:spin 40s linear infinite reverse}
.r3{inset:31%;background:radial-gradient(circle,rgba(255,90,16,.35),rgba(255,90,16,0) 70%);border:0;animation:breathe 4s ease-in-out infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes breathe{50%{transform:scale(1.12);opacity:.7}}
.orbit{position:absolute;inset:0;animation:spin 48s linear infinite}
.orb-chip{position:absolute;left:50%;top:50%;width:0;height:0;transform:rotate(calc(360deg / var(--n) * var(--i))) translateY(calc(min(440px,92vw) * -.5))}
.orb-chip>span{position:absolute;left:0;top:0;transform:translate(-50%,-50%) rotate(calc(-360deg / var(--n) * var(--i)));animation:counter 48s linear infinite;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;padding:7px 12px;border-radius:999px;background:rgba(15,27,42,.9);border:1px solid rgba(255,255,255,.16);font-size:12.5px;font-weight:600;color:#fff;box-shadow:0 8px 24px -8px rgba(0,0,0,.6)}
.orb-chip i{width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c)}
@keyframes counter{from{rotate:0deg}to{rotate:-360deg}}
.core{position:absolute;inset:36%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#2A3D53,#132233);border:1px solid rgba(255,255,255,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;box-shadow:0 0 60px rgba(255,90,16,.35),inset 0 0 30px rgba(255,255,255,.04)}
.core-ic{width:40px;height:40px;border-radius:12px;background:#FF5A10;display:grid;place-items:center;box-shadow:0 8px 20px -4px rgba(255,90,16,.8)}
.core-ic svg{width:22px;height:22px}
.core b{font-size:15px;margin-top:4px}
.core span:last-child{font-size:11px;color:#8FA2B5}
.feed{position:absolute;right:-8px;bottom:-6px;width:min(330px,88%);background:rgba(16,29,44,.82);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:12px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 30px 60px -20px rgba(0,0,0,.7)}
.feed-h{display:flex;justify-content:space-between;align-items:center;padding:2px 4px 8px;font-size:12px}
.live{display:inline-flex;align-items:center;gap:7px;font-weight:600;color:#E7EDF3}
.live i{width:7px;height:7px;border-radius:50%;background:#2BD68A;animation:blink 1.4s infinite}
.feed-note{color:#6F8296}
.feed-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;height:238px;overflow:hidden}
.fi{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);animation:fin .5s cubic-bezier(.2,.8,.2,1)}
@keyframes fin{from{opacity:0;transform:translateY(-14px) scale(.97)}}
.fi-ic{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--c);color:#0B1624}
.fi-ic svg{width:16px;height:16px}
.fi-t{display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:600;color:#fff}
.fi-t em{font-style:normal;font-weight:500;color:#6F8296;font-size:11px}
.fi p{margin:2px 0 0;font-size:12.5px;line-height:1.4;color:#B9C6D3}
.fi .tag{display:inline-block;margin-top:4px;font-size:10.5px;font-weight:700;letter-spacing:.04em;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.08);color:var(--c)}
@media (max-width:980px){.hx-stage{min-height:0;flex-direction:column;gap:20px}.feed{position:relative;right:auto;bottom:auto;width:100%;max-width:420px}.orb{width:min(360px,80vw)}.orb-chip{transform:rotate(calc(360deg / var(--n) * var(--i))) translateY(calc(min(360px,80vw) * -.5))}}
@media (max-width:520px){.orb-chip>span{font-size:11px;padding:5px 9px}}
.hx-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:clamp(40px,6vw,72px);padding-top:28px;border-top:1px solid rgba(255,255,255,.1)}
.hx-stats b{display:block;font-size:clamp(26px,3vw,36px);font-weight:700;letter-spacing:-.02em;color:#fff;white-space:nowrap}
.hx-stats span{font-size:14px;color:#8FA2B5}
@media (max-width:760px){.hx-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){.orbit,.orb-chip>span,.ring,.glow{animation:none!important}}
"""

FEED_JS = r"""
(function(){var box=document.querySelector('[data-feed] .feed-list');if(!box)return;
var ICO={alert:'<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>',box:'<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',rupee:'<path d="M6 4h12M6 9h12M6 4h3a5 5 0 010 10H6l8 6"/>',chef:'<path d="M6 14a4 4 0 01-1-7.9A5 5 0 0112 3a5 5 0 017 3.1A4 4 0 0118 14"/><path d="M6 14h12v6H6z"/>',fix:'<path d="M5 12l4 4 10-10"/>'};
var E=[['Shift watch','#FF7A3D','alert','7 voids worth ₹5,900 at Terminal 2. Bills sent to the manager.','ALERT'],
['Reorder','#22C55E','box','Tomorrow’s order drafted: 14 items, ₹38,450. Waiting for approval.','DRAFTED'],
['Booking agent','#2DD4BF','cal','Table for 4 at 8 PM confirmed on WhatsApp. Anniversary noted.','DONE'],
['Payout check','#60A5FA','rupee','Swiggy overcharged ₹9,800 in commission. Claim ready.','DRAFTED'],
['Kitchen pace','#FBBF24','chef','Tandoor at 16 min vs usual 9. Head chef alerted.','ALERT'],
['Win-back','#F472B6','users','312 regulars missing for 30 days. WhatsApp offer drafted.','DRAFTED'],
['Recipe cost drift','#22C55E','box','Paneer up 14%. 6 dishes lost margin; new prices suggested.','ALERT'],
['Support agent','#60A5FA','fix','KOT printer back online in 2 min 40 s.','FIXED']];
var k=0,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function svg(n){return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICO[n]+'</svg>';}
function push(){var e=E[k++%E.length],li=document.createElement('li');li.className='fi';li.style.setProperty('--c',e[1]);
li.innerHTML='<span class="fi-ic">'+svg(e[2])+'</span><div><div class="fi-t">'+e[0]+'<em>just now</em></div><p>'+e[3]+'</p><span class="tag">'+e[4]+'</span></div>';
box.insertBefore(li,box.firstChild);[].slice.call(box.children,1).forEach(function(n,i){var t=n.querySelector('em');if(t)t.textContent=(i+1)*2+' min ago';});while(box.children.length>4)box.removeChild(box.lastChild);}
push();push();push();if(!RM)setInterval(push,2800);})();
"""
