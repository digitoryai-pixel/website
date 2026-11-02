from core import *
from sim import VENUES

# Bento tiles: key, icon, label, widget html, agent name, agent action, colour
def _tiles():
    pos = '<div class="w-num"><span class="w-k">Sales today</span><b data-count="142380">₹1,42,380</b></div><div class="w-spark">' + "".join(f'<i style="--h:{h}%"></i>' for h in (30, 45, 38, 60, 52, 70, 64, 82, 76, 92)) + '</div>'
    kit = '<div class="w-tix">' + "".join(f'<div class="tk"><span>{t}</span><i><em style="--d:{d}s"></em></i></div>' for t, d in (("T6 · Grill", 6), ("T4 · Tandoor", 9), ("Swiggy #9042", 7))) + '</div>'
    inv = '<div class="w-stock">' + "".join(f'<div class="st"><span>{n}</span><i><em class="{c}" style="--w:{w}%"></em></i></div>' for n, w, c in (("Paneer", 18, "low"), ("Chicken", 64, ""), ("Rice", 80, ""))) + '</div>'
    gst = '<div class="w-guest"><div class="avs"><i>R</i><i>A</i><i>K</i><i>+</i></div><span class="bk">Table for 4 · 8:00 PM</span></div>'
    pay = '<div class="w-pay"><span class="ok">UPI ✓</span><span class="ok">Card ✓</span><span class="warn">Swiggy !</span></div>'
    own = '<div class="w-chat"><span class="cq">How did we do yesterday?</span><span class="ca">₹3.8L · up 6% on last week</span></div>'
    return [
        ("receipt", "Billing", pos, "Shift watch", "7 unusual voids flagged to the manager", "#E5531A"),
        ("chef", "Kitchen", kit, "Kitchen pace", "Tandoor running slow. Head chef alerted", "#D97706"),
        ("box", "Stock", inv, "Reorder", "Order for 14 items drafted. Approve?", "#15803D"),
        ("users", "Guests", gst, "Booking agent", "Confirmed on WhatsApp in under a minute", "#0F766E"),
        ("rupee", "Payments", pay, "Payout check", "₹9,800 Swiggy overcharge found", "#2563EB"),
        ("spark", "Owner", own, "Morning brief", "2 approvals waiting for you", "#7C3AED"),
    ]

def home_hero():
    tiles = "".join(f'''<div class="bt" style="--c:{c}"><div class="bt-h"><span class="bt-ic">{ic(i)}</span><b>{lbl}</b><span class="bt-ai">{ic("spark")}AI</span></div>{w}
<div class="bt-toast"><span class="bt-dot"></span><div><b>{an}</b><span>{aa}</span></div></div></div>''' for i, lbl, w, an, aa, c in _tiles())
    venues = "".join(f'<a class="hv-chip" href="#experience" data-pick-venue="{k}">{ic(i)}<span>{t}</span></a>' for k, i, t in VENUES)
    return f'''<section class="hx" aria-labelledby="hx-h">
<div class="hx-bg" aria-hidden="true"></div>
<div class="wrap hx-grid">
  <div class="hx-copy">
    <span class="hx-pill"><span class="hx-dot"></span>Pioneering AI agents for restaurants in India</span>
    <h1 id="hx-h">Your restaurant, now with an <span class="hx-grad">AI assistant</span>.</h1>
    <p class="hx-lede">AI agents watch your billing, kitchen, stock and guests around the clock. They catch problems before they cost you, do the legwork, and ask before they act. Built on the platform that already runs 600+ outlets.</p>
    <div class="actions"><a class="btn btn-primary btn-lg" href="{L("demo")}">Book a demo {ARROW}</a><a class="btn btn-ghost btn-lg" href="#experience">Watch the agents work</a></div>
    <div class="hx-venues"><span>See the agents at your…</span><div>{venues}</div></div>
  </div>
  <div class="bento-wrap" aria-label="Animated example: Digitory AI agents working across billing, kitchen, stock, guests, payments and the owner’s brief, with sample data">
    <div class="bento-top"><span class="live"><i></i>Digitory AI · agents active</span><span class="feed-note">Sample data</span></div>
    <div class="bento" data-bento>{tiles}</div>
  </div>
</div>
<div class="wrap hx-stats">
  <div><b>600+</b><span>outlets run on Digitory</span></div><div><b>10 cities</b><span>in India, and 3 countries</span></div><div><b>₹1,000 Cr+</b><span>billed every year</span></div><div><b>24×7</b><span>AI watching, you in charge</span></div>
</div>
</section>'''

HERO_CSS = """
/* Premium AI hero (light) */
.hx{position:relative;overflow:hidden;background:#fff;padding-block:clamp(48px,7vw,96px) 32px;isolation:isolate}
.hx-bg{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse 50% 45% at 80% 25%,rgba(255,90,16,.12),transparent 70%),radial-gradient(ellipse 40% 40% at 10% 90%,rgba(46,69,96,.07),transparent 70%)}
.hx-bg::after{content:"";position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse 60% 60% at 75% 35%,#000 0%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 60% 60% at 75% 35%,#000 0%,transparent 75%);opacity:.8}
.hx-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:clamp(36px,5vw,72px);align-items:center}
@media (max-width:1020px){.hx-grid{grid-template-columns:minmax(0,1fr)}}
.hx-copy{display:flex;flex-direction:column;gap:24px}
.hx-pill{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;padding:7px 16px 7px 12px;border-radius:999px;background:var(--orange-l);border:1px solid #FFD2BC;font-size:13.5px;font-weight:600;color:#B4410B}
.hx-dot{width:8px;height:8px;border-radius:50%;background:#FF5A10;box-shadow:0 0 0 0 rgba(255,90,16,.6);animation:ping 2s infinite}
@keyframes ping{70%{box-shadow:0 0 0 9px rgba(255,90,16,0)}100%{box-shadow:0 0 0 0 rgba(255,90,16,0)}}
.hx h1{font-size:clamp(34px,4vw,54px);line-height:1.03;letter-spacing:-.04em;color:var(--ink)}
.hx-grad{background:linear-gradient(92deg,#FF5A10 10%,#FF8A3D 60%,#F59E0B);-webkit-background-clip:text;background-clip:text;color:transparent}
.hx-lede{font-size:clamp(17px,1.45vw,19.5px);line-height:1.6;color:var(--muted);max-width:34em}
.btn-lg{min-height:56px;padding:0 28px;font-size:16.5px}
.hx .btn-primary{box-shadow:0 12px 28px -12px rgba(255,90,16,.75)}
.hx-venues{display:flex;flex-direction:column;gap:10px}
.hx-venues>span{font-size:13px;color:var(--soft);font-weight:600}
.hx-venues>div{display:flex;flex-wrap:wrap;gap:8px}
.hv-chip{display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);font-size:13.5px;font-weight:500;text-decoration:none;transition:all .15s}
.hv-chip svg{width:16px;height:16px;color:var(--orange)}
.hv-chip:hover{border-color:var(--orange);background:var(--orange-l)}
/* bento */
.bento-wrap{background:linear-gradient(180deg,#FBFCFD,#F3F6F9);border:1px solid var(--line);border-radius:28px;padding:16px;box-shadow:0 50px 100px -40px rgba(34,51,69,.35),0 0 0 8px rgba(255,255,255,.7)}
.bento-top{display:flex;justify-content:space-between;align-items:center;padding:2px 6px 12px;font-size:12.5px}
.live{display:inline-flex;align-items:center;gap:8px;font-weight:600;color:var(--ink)}
.live i{width:8px;height:8px;border-radius:50%;background:#22C55E;animation:blink 1.4s infinite}
.feed-note{color:var(--soft);font-size:12px}
.bento{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.bt{position:relative;background:#fff;border:1px solid #E6EBF0;border-radius:18px;padding:14px;min-height:150px;display:flex;flex-direction:column;gap:10px;overflow:hidden;transition:border-color .35s,box-shadow .35s,transform .35s}
.bt-h{display:flex;align-items:center;gap:8px;font-size:13.5px}
.bt-ic{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 12%,#fff);color:var(--c)}
.bt-ic svg{width:16px;height:16px}
.bt-ai{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:700;color:var(--soft);border:1px solid var(--line);border-radius:999px;padding:2px 7px;transition:all .3s}
.bt-ai svg{width:11px;height:11px}
.bt.on{border-color:color-mix(in srgb,var(--c) 55%,#fff);box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 12%,transparent),0 18px 36px -18px color-mix(in srgb,var(--c) 60%,transparent);transform:translateY(-2px)}
.bt.on .bt-ai{background:var(--c);color:#fff;border-color:var(--c)}
.bt-toast{position:absolute;left:10px;right:10px;bottom:10px;display:flex;gap:10px;align-items:flex-start;background:var(--ink);color:#fff;border-radius:12px;padding:10px 12px;font-size:12.5px;line-height:1.35;transform:translateY(130%);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .3s}
.bt.on .bt-toast{transform:none;opacity:1}
.bt-toast b{display:block;font-size:12px;color:color-mix(in srgb,var(--c) 45%,#fff)}
.bt-toast span{color:#DCE4EC}
.bt-dot{width:8px;height:8px;border-radius:50%;background:var(--c);margin-top:4px;flex:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 30%,transparent)}
/* widgets */
.w-num .w-k{display:block;font-size:11.5px;color:var(--soft)}
.w-num b{font-size:22px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.w-spark{display:flex;align-items:flex-end;gap:4px;height:34px}
.w-spark i{flex:1;height:var(--h);background:linear-gradient(#FFB08A,#FF5A10);border-radius:3px;opacity:.85;animation:grow 2.4s ease-in-out infinite alternate}
.w-spark i:nth-child(odd){animation-delay:.4s}
@keyframes grow{from{transform:scaleY(.75);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}
.w-tix,.w-stock{display:grid;gap:7px}
.tk,.st{display:grid;grid-template-columns:96px minmax(0,1fr);gap:8px;align-items:center;font-size:12px;color:var(--muted)}
.tk i,.st i{height:6px;background:#EEF1F4;border-radius:6px;overflow:hidden}
.tk em{display:block;height:100%;background:#F59E0B;border-radius:6px;animation:fill var(--d) linear infinite}
@keyframes fill{from{width:0}to{width:100%}}
.st em{display:block;height:100%;width:var(--w);background:#22C55E;border-radius:6px}
.st em.low{background:#EF4444;animation:low 1.6s ease-in-out infinite}
@keyframes low{50%{opacity:.45}}
.w-guest{display:flex;flex-direction:column;gap:8px}
.avs{display:flex}
.avs i{width:30px;height:30px;border-radius:50%;border:2px solid #fff;margin-left:-8px;display:grid;place-items:center;font-style:normal;font-size:11px;font-weight:700;color:#fff;background:#0F766E}
.avs i:first-child{margin-left:0}.avs i:nth-child(2){background:#14B8A6}.avs i:nth-child(3){background:#5EEAD4;color:#0F766E}.avs i:nth-child(4){background:#E6EBF0;color:var(--muted)}
.bk{font-size:12.5px;font-weight:600;background:#E7F6F4;color:#0F766E;border-radius:8px;padding:5px 9px;align-self:flex-start}
.w-pay{display:flex;flex-wrap:wrap;gap:6px}
.w-pay span{font-size:12px;font-weight:600;border-radius:8px;padding:5px 9px}
.w-pay .ok{background:#E9F7F0;color:#11845B}.w-pay .warn{background:#FFF1EA;color:#C2410C;animation:low 1.6s ease-in-out infinite}
.w-chat{display:flex;flex-direction:column;gap:6px;font-size:12.5px}
.w-chat .cq{align-self:flex-end;background:var(--ink);color:#fff;border-radius:12px 12px 3px 12px;padding:6px 10px}
.w-chat .ca{align-self:flex-start;background:#F2ECFD;color:#5B21B6;border-radius:12px 12px 12px 3px;padding:6px 10px;font-weight:600}
@media (max-width:520px){.bento{gap:8px}.bt{padding:11px;min-height:142px}.tk,.st{grid-template-columns:70px minmax(0,1fr)}.tk span,.st span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.w-num b{font-size:18px}.bt-toast{font-size:11.5px;padding:8px 10px}}
.hx-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:clamp(40px,6vw,72px);padding-top:28px;border-top:1px solid var(--line)}
.hx-stats b{display:block;font-size:clamp(26px,3vw,36px);font-weight:700;letter-spacing:-.02em;color:var(--ink);white-space:nowrap}
.hx-stats span{font-size:14px;color:var(--muted)}
@media (max-width:760px){.hx-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){.w-spark i,.tk em,.st em.low,.w-pay .warn{animation:none!important}.tk em{width:60%}}
"""

FEED_JS = r"""
(function(){var g=document.querySelector('[data-bento]');if(!g)return;var t=[].slice.call(g.children),k=0,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function step(){t.forEach(function(x){x.classList.remove('on');});t[k%t.length].classList.add('on');k++;}
step();if(!RM){var iv=setInterval(step,2600);g.addEventListener('mouseenter',function(){clearInterval(iv);});g.addEventListener('mouseleave',function(){iv=setInterval(step,2600);});
t.forEach(function(x,i){x.addEventListener('mouseenter',function(){t.forEach(function(y){y.classList.remove('on');});x.classList.add('on');k=i+1;});});}
var n=g.querySelector('[data-count]');if(n&&!RM){var v=+n.getAttribute('data-count');setInterval(function(){v+=Math.round(200+Math.random()*1800);n.textContent='₹'+v.toLocaleString('en-IN');},1700);}})();
"""
