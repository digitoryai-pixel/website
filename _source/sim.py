from core import *

VENUES = [("bars", "beer", "Brewery or bar"), ("cafes", "coffee", "Café or QSR"), ("fine", "dine", "Fine dining"),
          ("cloud", "cloud", "Cloud kitchen"), ("chains", "building", "Restaurant chain"), ("events", "music", "Club or events")]
STAGE_TABS = ["Onboarding", "Service", "Recipe cost", "Buying", "Guests", "Support", "Owner brief"]
SLUG_TO_VENUE = {"s-bars": "bars", "s-cafes": "cafes", "s-fine": "fine", "s-cloud": "cloud", "s-chains": "chains", "s-events": "events"}

def venue_picker(prefix="See a day at your"):
    """Small chips for hero sections; each jumps to the simulator with that venue."""
    chips = "".join(f'<a class="vchip" href="#experience" data-pick-venue="{k}">{ic(i)}<span>{t}</span></a>' for k, i, t in VENUES)
    return f'<div class="vpick"><span class="vpick-l">{prefix}…</span><div class="vpick-row">{chips}</div></div>'

def sim_section(venue="", title="See Digitory run a day at your venue", lede=None, bg="bg-soft", set=""):
    lede = lede or "Pick your kind of venue and watch the AI agents that matter most for it at work. Tap approve, just like you would."
    vb = "".join(f'<button type="button" class="vbtn" data-venue-btn="{k}" aria-pressed="false">{ic(i)}<span>{t}</span></button>' for k, i, t in VENUES)
    tabs = ""
    picker = "" if (venue or set) else f'<div class="sim-venues" role="group" aria-label="Choose your venue type">{vb}</div>'
    return f'''<section class="section {bg}" id="experience"><div class="wrap">
<div class="head"><span class="eyebrow">Interactive simulation</span><h2>{title}</h2><p class="lede">{lede}</p></div>
<div class="sim" data-sim data-venue="{venue}" data-set="{set}">
  {picker}
  <div class="sim-stages" role="tablist" aria-label="Simulation scenes" hidden>{tabs}</div>
  <div class="sim-progress" aria-hidden="true"><i></i></div>
  <div class="sim-body">
    <div class="sim-screen">
      <div class="sim-top"><span class="av">{ic("spark")}</span><div><b><span class="sim-venue-name">Your venue</span></b><span>Digitory AI agents and team</span></div><span class="sim-live">LIVE</span></div>
      <div class="sim-feed" aria-live="polite"></div>
      <div class="sim-foot">Simulation with sample data</div>
    </div>
    <div class="sim-side">
      <div class="sim-side-body"><span class="eyebrow">How it works</span><h3>Short scenes, each run by an AI agent</h3><p class="muted">Choose your venue type to start. Each scene shows an agent at work and the people behind it. You approve every change.</p></div>
      <div class="sim-lead form-wrap" hidden>
        <h3>Want this running at your <span class="sim-lead-venue">venue</span>?</h3>
        <p class="muted small">Leave your number and we’ll set up a walkthrough on a menu like yours.</p>
        <form class="sim-form" data-lead action="/api/demo" method="post">
          <input type="hidden" name="type" value="">
          <label class="sr" for="sl-name">Your name</label><input id="sl-name" name="name" placeholder="Your name" autocomplete="name" required>
          <label class="sr" for="sl-phone">Mobile number</label><input id="sl-phone" name="phone" type="tel" placeholder="Mobile number" autocomplete="tel" inputmode="tel" required>
          <label class="sr" for="sl-out">Outlets</label><select id="sl-out" name="outlets"><option>1 outlet</option><option>2–5 outlets</option><option>6–20 outlets</option><option>21+ outlets</option></select>
          <button class="btn btn-primary" type="submit">Book my walkthrough {ARROW}</button>
        </form>
        <p class="form-ok" role="status">Thank you. We’ll call you within one working day.</p>
      </div>
    </div>
  </div>
  <noscript><p class="muted mt-16">Turn on JavaScript to play the simulation, or <a href="{L("demo")}">book a live demo</a>.</p></noscript>
</div></div></section>'''

SIM_CSS = """
/* Simulator */
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.vpick{display:flex;flex-direction:column;gap:10px;margin-top:6px}
.vpick-l{font-size:14px;font-weight:600;color:var(--muted)}
.vpick-row{display:flex;flex-wrap:wrap;gap:8px}
.vchip{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border:1.5px solid var(--line);border-radius:999px;background:#fff;font-size:14px;font-weight:500;text-decoration:none;transition:border-color .15s,background .15s}
.vchip svg{width:17px;height:17px;color:var(--orange)}
.vchip:hover{border-color:var(--orange);background:var(--orange-l)}
.sim{background:#fff;border:1px solid var(--line);border-radius:28px;padding:clamp(16px,2.4vw,28px);box-shadow:0 40px 80px -40px rgba(34,51,69,.35);display:flex;flex-direction:column;gap:16px}
.sim-venues{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:8px}
.vbtn{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1.5px solid var(--line);border-radius:14px;background:#fff;font:inherit;font-size:14.5px;font-weight:600;color:var(--ink);cursor:pointer;text-align:left;min-height:52px;transition:border-color .15s,background .15s}
.vbtn svg{width:20px;height:20px;color:var(--orange);flex:none}
.vbtn:hover{border-color:#F6B79A}
.vbtn[aria-pressed="true"]{border-color:var(--orange);background:var(--orange-l);box-shadow:0 0 0 3px rgba(255,90,16,.12)}
.sim-stages{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.sim-stages::-webkit-scrollbar{display:none}
.stab{flex:1 0 auto;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;border:0;background:var(--bg-2);font:inherit;font-size:13.5px;font-weight:500;color:var(--muted);cursor:pointer;white-space:nowrap}
.stab b{width:22px;height:22px;border-radius:7px;background:#fff;display:grid;place-items:center;font-size:12px;color:var(--ink)}
.stab[aria-selected="true"]{background:var(--navy);color:#fff}
.stab[aria-selected="true"] b{background:var(--orange);color:#fff}
.stab.done b{background:#E9F7F0;color:var(--ok)}
.sim-progress{height:3px;background:var(--bg-2);border-radius:3px;overflow:hidden}
.sim-progress i{display:block;height:100%;width:0;background:var(--orange);transition:width .5s}
.sim-body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(18px,3vw,36px);align-items:start}
@media (max-width:900px){.sim-body{grid-template-columns:minmax(0,1fr)}}
.sim-screen{background:#F3F5F8;border:1px solid #DFE5EC;border-radius:22px;overflow:hidden;display:flex;flex-direction:column;height:560px}
@media (max-width:600px){.sim-screen{height:500px}}
.sim-top{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--navy);color:#fff}
.sim-top .av{width:34px;height:34px;border-radius:10px;background:var(--orange);display:grid;place-items:center;flex:none}
.sim-top .av svg{width:18px;height:18px}
.sim-top b{display:block;font-size:14px;line-height:1.2}
.sim-top div span{font-size:11.5px;color:#AABCCC}
.sim-live{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.1em;color:#7CE0B0;display:flex;align-items:center;gap:6px}
.sim-live::before{content:"";width:7px;height:7px;border-radius:50%;background:#2BD68A;animation:blink 1.4s infinite}
@keyframes blink{50%{opacity:.25}}
.sim-feed{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;overscroll-behavior:contain}
.sim-foot{font-size:11px;color:var(--soft);text-align:center;padding:6px;border-top:1px solid #E3E8EE;background:#fff}
.sim-feed>*{opacity:0;transform:translateY(8px);transition:opacity .35s,transform .35s}
.sim-feed>.in{opacity:1;transform:none}
.sim-idle{margin:auto;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;max-width:340px;opacity:1!important;transform:none!important}
.sim-idle-grid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:6px}
.chip-btn{font:inherit;font-size:14px;font-weight:600;padding:10px 14px;border-radius:999px;border:1.5px solid var(--line);background:#fff;cursor:pointer;color:var(--ink)}
.chip-btn:hover{border-color:var(--orange);background:var(--orange-l)}
.sim-sys{align-self:center;font-size:11.5px;font-weight:600;color:var(--muted);background:#E6EBF0;padding:4px 12px;border-radius:999px}
.sim-msg{max-width:86%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;background:#fff;border:1px solid #E1E7EE}
.sim-msg p{margin:2px 0 0}
.sim-who{font-size:11px;font-weight:700;letter-spacing:.02em;color:var(--orange);display:block}
.sim-msg.you,.sim-msg.guest{align-self:flex-end;background:var(--navy);color:#fff;border-color:var(--navy);border-bottom-right-radius:4px}
.sim-msg.you .sim-who,.sim-msg.guest .sim-who{color:#FFB48F}
.sim-msg.ai{align-self:flex-start;border-bottom-left-radius:4px}
.sim-msg.team{align-self:flex-start;background:#E9F7F0;border-color:#BFE6D3;border-bottom-left-radius:4px}
.sim-msg.team .sim-who{color:var(--ok)}
.sim-file{display:inline-block;margin-top:6px;font-size:12px;background:rgba(255,255,255,.12);padding:4px 10px;border-radius:8px}
.sim-typing{align-self:flex-start;background:#fff;border:1px solid #E1E7EE;border-radius:14px;padding:12px 14px;display:flex;gap:4px}
.sim-typing i{width:6px;height:6px;border-radius:50%;background:#AABCCC;animation:dots 1s infinite}
.sim-typing i:nth-child(2){animation-delay:.15s}.sim-typing i:nth-child(3){animation-delay:.3s}
@keyframes dots{50%{transform:translateY(-3px);opacity:.5}}
.sim-card{background:#fff;border:1px solid #E1E7EE;border-radius:14px;padding:12px 14px;font-size:13.5px;display:flex;flex-direction:column;gap:2px;width:min(100%,420px)}
.sim-card>b{font-size:13px;margin-bottom:4px}
.sim-row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px solid #EEF1F4}
.sim-row span:last-child{font-weight:600;text-align:right;font-variant-numeric:tabular-nums}
.sim-card.feed .sim-row{opacity:0;transform:translateX(-8px);transition:all .3s}
.sim-card.feed .sim-row.in{opacity:1;transform:none}
.sim-row.good span:last-child{color:var(--ok)}.sim-row.bad span:last-child{color:#C2410C}.sim-row.warn span:last-child{color:#B45309}
.sim-bar{height:6px;background:#EEF1F4;border-radius:6px;overflow:hidden;margin-top:6px}
.sim-bar i{display:block;height:100%;width:0;background:var(--orange);border-radius:6px;transition:width 1.2s ease}
.sim-stock{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:6px 0;border-top:1px solid #EEF1F4}
.sim-stock .sim-bar{grid-column:1/-1;margin-top:2px}
.sim-num{font-weight:600;font-variant-numeric:tabular-nums}
.sim-ask{align-self:stretch;background:#FFF6F1;border:1.5px solid #FFC8AE;border-radius:14px;padding:12px 14px;font-size:14px}
.sim-ask p{margin:2px 0 10px}
.sim-ask-act{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.sim-approve{font:inherit;font-size:14px;font-weight:600;color:#fff;background:var(--orange);border:0;border-radius:10px;padding:10px 18px;cursor:pointer;min-height:44px;animation:pulse 1.6s infinite}
.sim-approve:hover{background:var(--orange-d)}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,90,16,.45)}70%{box-shadow:0 0 0 10px rgba(255,90,16,0)}100%{box-shadow:0 0 0 0 rgba(255,90,16,0)}}
.sim-hint{font-size:12px;color:var(--muted)}
.sim-ask.ok{background:#E9F7F0;border-color:#A7DCC2}
.sim-done{color:var(--ok);font-weight:600;font-size:13.5px}
.sim-side{display:flex;flex-direction:column;gap:20px;padding-top:4px}
.sim-side-body{display:flex;flex-direction:column;gap:14px}
.sim-side h3{font-size:clamp(22px,2.4vw,28px);line-height:1.2;letter-spacing:-.02em}
.sim-agents{display:flex;flex-wrap:wrap;gap:6px}
.sim-agent{font-size:12.5px;font-weight:600;padding:5px 10px;border-radius:999px;background:var(--bg-2);border:1px solid var(--line)}
.sim-outcome{background:var(--navy);color:#fff;border-radius:14px;padding:14px 16px;font-size:14.5px}
.sim-outcome p{margin:4px 0 0;color:#DCE4EC}
.sim-ctrl{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.sim-ctrl .btn{min-height:46px;padding:0 18px;font-size:15px}
.btn.pulse{animation:pulse 1.6s infinite}
.sim-lead{background:var(--orange-l);border:1px solid #FFD2BC;border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:10px}
.sim-lead h3{font-size:20px}
.sim-form{display:grid;gap:10px}
.sim-form input,.sim-form select{font:inherit;font-size:16px;padding:12px 14px;border:1.5px solid #E8C6B4;border-radius:10px;background:#fff;min-height:48px;color:var(--ink)}
.sim-lead.sent .sim-form{display:none}.sim-lead.sent .form-ok{display:block}
.sim-play{margin-top:6px}
.sim-sec-dark{background:var(--navy)}
"""

VIZ_CSS = """
/* Simulator graphics */
.sim-viz{width:min(100%,440px)}
.sim-list{margin:0;padding-left:18px;display:grid;gap:8px;color:var(--muted);font-size:15px}
.sim-list b{color:var(--ink)}
.gauge{position:relative;width:200px;max-width:100%;margin:6px auto 0}
.gauge svg{width:100%;display:block}
.g-val{position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:26px;font-weight:700;font-variant-numeric:tabular-nums}
.g-note{text-align:center;font-size:12px;color:var(--muted)}
.bars{display:flex;align-items:flex-end;gap:6px;height:150px;padding-top:18px}
.bar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0}
.bar i{display:block;width:100%;max-width:34px;height:0;background:#C9D4E0;border-radius:6px 6px 2px 2px;transition:height .7s cubic-bezier(.2,.8,.2,1)}
.bar.hi i{background:var(--orange)}
.bv{font-size:10.5px;font-weight:600;color:var(--muted);margin-bottom:3px}
.bar.hi .bv{color:var(--orange)}
.bl{font-size:10.5px;color:var(--muted);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.bottles{display:flex;justify-content:space-around;gap:10px;padding-top:6px}
.btl{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;text-align:center}
.btl svg{width:46px;height:104px}
.liq{transition:y 1.4s ease}
.bn{font-weight:600}.bs{color:var(--muted);line-height:1.35}
.btl.bad .bs b{color:#C2410C}
.floor{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:8px 4px}
.tbl{height:44px;border-radius:12px;border:2px dashed #CBD3DC;display:grid;place-items:center;font-size:12px;font-weight:600;color:var(--muted);transition:all .3s}
.tbl.booked{background:#E3E9F0;border:2px solid #C9D4E0;color:var(--ink)}
.tbl.free{background:#fff;border:2px solid #CDEBDC;color:var(--ok)}
.tbl.pick{background:var(--orange);border:2px solid var(--orange);color:#fff;transform:scale(1.06);box-shadow:0 8px 18px -6px rgba(255,90,16,.6)}
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:11.5px;color:var(--muted);align-items:center;margin-top:6px}
.lg{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:-8px}
.lg.booked{background:#C9D4E0}.lg.free{background:#CDEBDC}.lg.pick{background:var(--orange)}.lg.a{background:#C9D4E0}.lg.b{background:var(--orange)}.lg.par{background:var(--navy);width:3px}
.flowv{display:flex;align-items:center;justify-content:space-between;gap:2px;padding:10px 0 4px}
.fl-node{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--muted);text-align:center;opacity:.35;transition:opacity .3s;min-width:0}
.fl-ic{width:42px;height:42px;border-radius:12px;background:#EEF1F4;display:grid;place-items:center;color:var(--muted);transition:all .3s}
.fl-ic svg{width:20px;height:20px}
.fl-node.on{opacity:1;color:var(--ink)}
.fl-node.on .fl-ic{background:var(--orange);color:#fff;box-shadow:0 6px 14px -4px rgba(255,90,16,.5)}
.fl-line{flex:1;height:2px;background:#E1E7EE;position:relative;margin-bottom:22px;overflow:hidden;min-width:10px}
.fl-line i{position:absolute;inset:0;background:var(--orange);transform:scaleX(0);transform-origin:left;transition:transform .35s}
.fl-line.on i{transform:scaleX(1)}
.ticketwrap{display:flex;flex-direction:column;align-items:center;width:220px;align-self:center}
.printer{width:220px;background:var(--navy);color:#fff;border-radius:12px 12px 4px 4px;padding:8px 12px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;position:relative;z-index:2}
.printer svg{width:18px;height:18px}
.ticket{width:180px;overflow:hidden;max-height:0;transition:max-height 1.1s ease}
.ticket.out{max-height:220px}
.tk-in{background:#fff;padding:12px 14px 16px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;line-height:1.7;border:1px solid #E1E7EE;border-top:0;clip-path:polygon(0 0,100% 0,100% 94%,92% 100%,84% 94%,76% 100%,68% 94%,60% 100%,52% 94%,44% 100%,36% 94%,28% 100%,20% 94%,12% 100%,4% 94%,0 100%)}
.tk-h{font-weight:700;border-bottom:1px dashed #AABCCC;margin-bottom:4px}
.tk-t{color:var(--muted);font-size:11px}
.qrow{display:grid;grid-template-columns:48px minmax(0,1fr) 26px;gap:8px;align-items:center;padding:7px 0;border-top:1px solid #EEF1F4;font-size:13px}
.qn{font-weight:600}.qc{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.qd{display:flex;flex-wrap:wrap;gap:3px}
.qd i{width:9px;height:9px;border-radius:50%;background:#AABCCC;transform:scale(0);transition:transform .25s}
.qd i.on{transform:scale(1)}
.qrow.long .qd i{background:var(--orange)}.qrow.long .qc{color:var(--orange)}
.cmp,.lvlrow{display:grid;grid-template-columns:88px minmax(0,1fr) auto;gap:10px;align-items:center;padding:7px 0;border-top:1px solid #EEF1F4;font-size:13px}
.cn{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cv{font-size:12px;color:var(--muted);white-space:nowrap}.cmp.bad .cv b{color:#C2410C}
.cb{display:flex;flex-direction:column;gap:3px}
.cb i{display:block;height:7px;border-radius:4px;width:0;transition:width 1s ease}
.cb i.a{background:#C9D4E0}.cb i.b{background:var(--navy)}
.cmp.bad .cb i.b{background:var(--orange)}
.lb{position:relative;height:12px;background:#EEF1F4;border-radius:6px}
.lb i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:6px;background:#9BC9B2;transition:width 1s ease}
.lvlrow.low .lb i{background:var(--orange)}
.lvlrow.low .cv{color:#C2410C;font-weight:600}
.lb em{position:absolute;top:-4px;bottom:-4px;width:3px;background:var(--navy);border-radius:2px}
.strow{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid #EEF1F4;font-size:13.5px}
.st-dot{display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:12.5px;color:var(--soft)}
.st-dot i{width:10px;height:10px;border-radius:50%;background:#D5DCE3}
.st-dot.in[data-s="on"]{color:var(--ok)}.st-dot.in[data-s="on"] i{background:#2BB673}
.st-dot.in[data-s="warn"]{color:#B45309}.st-dot.in[data-s="warn"] i{background:#F2A93B}
.st-dot.in[data-s="off"]{color:#C2410C}.st-dot.in[data-s="off"] i{background:#E5531A;animation:blink 1s infinite}
.mx{position:relative;height:200px;margin:8px 4px 18px 18px;border-left:2px solid #C9D4E0;border-bottom:2px solid #C9D4E0;background:linear-gradient(#EEF1F4,#EEF1F4) 50% 0/1px 100% no-repeat,linear-gradient(#EEF1F4,#EEF1F4) 0 50%/100% 1px no-repeat}
.q{position:absolute;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#AABCCC}
.q1{left:6px;top:4px}.q2{right:6px;top:4px}.q3{left:6px;bottom:4px}.q4{right:6px;bottom:4px}
.md{position:absolute;transform:translate(-50%,50%) scale(0);transition:transform .35s cubic-bezier(.3,1.6,.5,1);display:flex;flex-direction:column;align-items:center;gap:2px}
.md.on{transform:translate(-50%,50%) scale(1)}
.md i{width:14px;height:14px;border-radius:50%;background:var(--navy);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.md.star i{background:#2BB673}.md.work i{background:var(--orange)}.md.puzzle i{background:#6D8BEA}.md.dog i{background:#AABCCC}
.md em{font-style:normal;font-size:10.5px;font-weight:600;white-space:nowrap;background:rgba(255,255,255,.9);padding:0 4px;border-radius:4px}
.ax{position:absolute;font-size:10px;color:var(--muted)}
.ax1{right:0;bottom:-17px}.ax2{left:-16px;top:40%;transform:rotate(-90deg);transform-origin:left top}
.pf{display:flex;gap:12px;align-items:center;margin-bottom:6px}
.pf-av{width:44px;height:44px;border-radius:50%;background:var(--orange);color:#fff;display:grid;place-items:center;font-weight:700}
.pf-tag{display:inline-block;font-size:11px;font-weight:700;color:#B45309;background:#FFF4DE;border-radius:999px;padding:1px 8px;margin-left:6px}
.hubsvg{width:100%;max-width:280px;display:block;margin:0 auto}
.hubsvg text{font-size:9px;font-weight:600;fill:#223345;font-family:Poppins,sans-serif}
.hn{fill:#fff;stroke:#C9D4E0;stroke-width:1.5}
.hc{fill:#223345}.hct{fill:#fff!important;font-size:9.5px!important}
.hl{stroke:#E1E7EE;stroke-width:1.5;stroke-dasharray:3 3}
.hdot{fill:#FF5A10}
"""
