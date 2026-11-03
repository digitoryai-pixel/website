from core import *

# key, group, name, size, yearly (int or "from"), ai mode, typical AI per month, icon
PLANS = [
 ("cloud", "rest", "Cloud Kitchen", "Delivery-only kitchens, one or many brands", 15000, "core", 0, "cloud"),
 ("qsr", "rest", "QSR / Darshini", "Counter service and quick turnover", 25000, "core", 0, "coffee"),
 ("cafe", "rest", "Café", "Up to 60 seats", 45000, "core", 0, "coffee"),
 ("fine", "rest", "Fine Dine", "60+ seats, table service", 65000, "core", 0, "dine"),
 ("smallpub", "bar", "Small Pub / Bar", "Up to 150 seats", 65000, "wallet", 1083, "beer"),
 ("pub", "bar", "Pub", "150 to 300 seats", 95000, "wallet", 2040, "beer"),
 ("largepub", "bar", "Large Pub", "300 to 500 seats", 135000, "wallet", 2733, "music"),
 ("brewery", "bar", "Brewery / Mega Venue", "500+ seats, or brewing on site", 165000, "wallet", 3792, "building"),
]
BASE = ["POS and billing", "QR ordering", "Kitchen display (KDS)", "Inventory and recipe costing", "Live reports on web and mobile", "Onboarding, training and support"]
BAR_EXTRA = ["Bottle, peg and keg stock", "Excise registers"]
RATES = [("Alert or insight", "“7 voids on terminal 2 since 6 PM”", "₹0.50"),
         ("Morning brief", "Your daily summary on WhatsApp", "₹1"),
         ("Prepared action", "A draft purchase order or price change, ready to approve", "₹1.50"),
         ("DigiTalk question", "“How did Friday compare to last Friday?”", "₹3"),
         ("Deep analysis", "Month-end variance, menu engineering", "₹21")]
ADDONS = [("CRM and loyalty", "Guest profiles, rewards and campaigns"), ("Table reservations", "Bookings, waitlist and guest notes"),
          ("Feedback", "Post-visit feedback and review tracking"), ("Prepaid and cashless", "Wallets and cards for clubs, events and campuses"),
          ("Accounting automation", "Sales, purchases and GST posted to your books"), ("Central kitchen", "Production, indents and transfers to outlets"),
          ("Multi-store console", "One menu, prices and reports across outlets"), ("Managed Inventory", "Our team runs the system side of your stock control")]
FAQ = [("Are prices per outlet?", "Yes. Every price is per outlet, per year, billed in advance. GST is extra. Groups with several outlets get a quote with volume pricing."),
       ("What is the AI wallet?", "Pubs, bars and breweries pay a lower subscription and top up a prepaid AI wallet in rupees. Each agent action takes a small amount from it. You see every deduction in a monthly statement."),
       ("What happens when the wallet runs out?", "The agents pause. Billing, KOTs, stock and reports keep working as normal. You get a warning at 20% and 5% balance, with a one-tap top-up link."),
       ("Do restaurants and cafés get AI too?", "Yes. Core AI is included in every restaurant plan: the morning brief and up to 5 alerts a day. More agents can run on the same prepaid wallet."),
       ("Is hardware included?", "No. We tell you what you can reuse and what to buy before you spend anything. Hardware purchase, installation and configuration stay with you."),
       ("Cloud or on-premise?", "Both. Cloud suits most venues. Hybrid, with a local server on site, is recommended for large properties.")]

def inr(n):
    s = str(int(n)); h, t = s[:-3], s[-3:]; p = []
    while len(h) > 2: p.insert(0, h[-2:]); h = h[:-2]
    if h: p.insert(0, h)
    return "₹" + ",".join(p + [t]) if p else "₹" + s

def price_html(y, frm):
    pre = '<span class="pp-from">From</span>' if frm else ""
    return f'{pre}<b class="pp-y">{inr(y)}</b><span class="pp-u">/ outlet / year</span>'

def pricing_page():
    def quote(k): return L("demo") + f"?plan={k}"
    # finder
    chips = "".join(f'<button type="button" class="pf-chip" data-plan-btn="{k}" aria-pressed="false">{ic(i)}<span>{n}</span></button>' for k, g, n, s, y, m, a, i in PLANS)
    panels = ""
    for k, g, n, s, y, m, a, i in PLANS:
        inc = BASE + (BAR_EXTRA if g == "bar" else [])
        ai = ('<div class="pp-ai"><b>AI: core included</b><span>Morning brief and up to 5 alerts a day. More agents on the prepaid wallet.</span></div>' if m == "core"
              else f'<div class="pp-ai"><b>AI: prepaid wallet</b><span>All pub agents. Typical use is about {inr(a)} a month, topped up as you go.</span></div>')
        panels += f'''<div class="pp" data-plan="{k}" hidden><div class="pp-top"><div><span class="eyebrow" style="font-size:12px">{"Bars, pubs and breweries" if g=="bar" else "Restaurants and cafés"}</span><h3>{n}</h3><p class="muted">{s}</p></div>
<div class="pp-price">{price_html(y, k=="brewery")}<span class="pp-m">About {inr(round(y/12))} a month, plus GST</span></div></div>
<div class="pp-body"><ul class="ticks">{"".join(f"<li><span>{x}</span></li>" for x in inc)}</ul>{ai}</div>
<div class="pp-act"><a class="btn btn-primary" href="{quote(k)}">Get a quote for {n} {ARROW}</a><a class="link" href="#addons">See add-ons</a></div></div>'''
    finder = f'''<div class="pfind"><p class="pf-q">What kind of venue do you run?</p><div class="pf-chips" role="group" aria-label="Choose your venue">{chips}</div>{panels}
<p class="pf-hint" data-plan-hint>Pick your venue to see your price and what’s included.</p></div>'''

    def card(p):
        k, g, n, s, y, m, a, i = p
        foot = "Core AI included" if m == "core" else f"+ AI wallet, typically {inr(a)}/month"
        return f'<a class="pc" href="{quote(k)}"><span class="pc-ic">{ic(i)}</span><b>{n}</b><span class="pc-s">{s}</span><span class="pc-p">{"From " if k=="brewery" else ""}{inr(y)}<small>/ year</small></span><span class="pc-f">{foot}</span><span class="link">Get a quote {ARROW}</span></a>'
    rest = "".join(card(p) for p in PLANS if p[1] == "rest"); bars = "".join(card(p) for p in PLANS if p[1] == "bar")
    rates = "".join(f'<tr><td><b>{a}</b><span class="small muted">{b}</span></td><td class="num">{c}</td></tr>' for a, b, c in RATES)
    adds = "".join(f'<div class="ad"><b>{a}</b><span>{b}</span></div>' for a, b in ADDONS)
    est = '''<div class="est" data-est><p class="est-q">Estimate a month of AI for a pub</p><div class="est-btns" role="group" aria-label="Usage">
<button type="button" data-est-btn="light">Light</button><button type="button" data-est-btn="typical" aria-pressed="true">Typical</button><button type="button" data-est-btn="heavy">Heavy</button></div>
<p class="est-r"><b data-est-v>₹2,040</b> a month</p><p class="small muted" data-est-d>25 alerts, 10 prepared actions, 1 brief and 12 questions a day</p></div>'''

    chapters = [
      ("Find your plan", "find", f'<section class="section pf-sec" id="find"><div class="wrap"><span class="eyebrow">Find your plan</span>{finder}<p class="small muted">Running several outlets or a mix of formats? <a class="link" href="{L("demo")}?plan=quote">Get a custom quote</a></p></div></section>'),
      ("All plans", "plans", f'''<section class="section bg-soft" id="plans"><div class="wrap"><div class="head"><span class="eyebrow">All plans</span><h2>Every plan, side by side</h2><p class="lede">Per outlet, per year, billed in advance. GST extra.</p></div>
<h3 class="pg-h">Restaurants and cafés <span>Core AI included</span></h3><div class="pcs">{rest}</div>
<h3 class="pg-h">Bars, pubs and breweries <span>Lower subscription plus prepaid AI wallet</span></h3><div class="pcs">{bars}</div></div></section>'''),
      ("AI wallet", "wallet", f'''<section class="section" id="wallet"><div class="wrap split" style="align-items:start"><div style="display:flex;flex-direction:column;gap:20px"><span class="eyebrow">AI wallet</span><h2>Pay only for the work the agents do</h2>
<p class="lede">Top up in rupees. Each agent action takes a small amount. Idle agents cost nothing, and you approve every change they suggest.</p>
<ul class="ticks"><li><span><b>Prepaid.</b> First load ₹5,000, then top up ₹2,500, ₹5,000, ₹10,000 or ₹25,000.</span></li><li><span><b>Warned early.</b> Alerts at 20% and 5% balance, with a one-tap top-up.</span></li><li><span><b>Never blocks billing.</b> At zero, agents pause and the POS keeps running.</span></li><li><span><b>Fully visible.</b> A monthly statement shows spend by agent and what each one caught.</span></li></ul>{est}</div>
<div class="card" style="padding:0;overflow:hidden"><table class="rt"><thead><tr><th>Agent action</th><th class="num">Price</th></tr></thead><tbody>{rates}</tbody></table></div></div></section>'''),
      ("Add-ons", "addons", f'''<section class="section bg-soft" id="addons"><div class="wrap"><div class="head"><span class="eyebrow">Add-ons</span><h2>Also on the platform</h2><p class="lede">Switch these on when you need them. Pricing depends on your setup, so we include it in your quote.</p></div><div class="ads">{adds}</div>
<p class="small muted mt-24">Hardware is not included. Purchase, installation and configuration stay with you; we tell you what you can reuse first.</p></div></section>'''),
      ("Questions", "faq", faq_html(FAQ, "Pricing questions")),
    ]
    import re
    story = ""
    for i, (lbl, a, h) in enumerate(chapters):
        h = re.sub(r'<section class="([^"]*)"( id="[^"]*")?', lambda m: f'<section class="{m.group(1)}" id="{a}" data-chap="{i+1:02d}" data-chap-label="{lbl}"', h, count=1)
        story += h
    stations = "".join(f'<li><a href="#{a}" data-stop="{i+1:02d}"><span class="rm-node"><b>{i+1:02d}</b></span><span class="rm-lbl">{lbl}</span></a></li>' for i, (lbl, a, h) in enumerate(chapters))
    rail = f'<nav class="routemap" aria-label="Jump to a section" data-routemap><div class="wrap rm-in"><span class="rm-now" aria-hidden="true"><span class="rm-k">You are here</span><b data-rm-now>Start</b></span><div class="rm-scroll"><ol class="rm-track"><span class="rm-line" aria-hidden="true"><i data-rm-fill></i></span>{stations}</ol></div></div></nav>'
    hero = page_hero([("Home", "home"), ("Pricing", "pricing")], "Pricing", "Simple pricing for every kind of venue",
                     "One price per outlet, set by the kind and size of venue you run. Pubs and bars pay less up front and top up AI as they use it.", actions=False)
    body = rail + hero + story + cta("Get a quote for your venue", "Tell us your venue type and outlet count. We’ll send a clear quote and proposal, usually within one working day.")
    return doc("pricing", "Pricing | Digitory Restaurant POS, Inventory and AI Agents",
               "Digitory pricing per outlet per year for cloud kitchens, QSRs, cafés, fine dining, pubs, bars and breweries, with a prepaid AI wallet for pubs.", body,
               [crumbs_ld([("Home", "home"), ("Pricing", "pricing")])])

PRICING_CSS = r"""
.pfind{display:flex;flex-direction:column;gap:18px;align-items:stretch}
.pf-q{font-weight:600;margin:0;text-align:left;font-size:clamp(22px,2.2vw,28px);letter-spacing:-.02em}
.page-hero+.pf-sec,.pf-sec{padding-top:8px}
.pf-sec .wrap{display:flex;flex-direction:column;gap:14px}
.pf-chips{display:flex;flex-wrap:wrap;gap:10px}
.pf-chip{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:15px;font-weight:600;padding:10px 16px;border-radius:99px;border:1.5px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;transition:all .15s}
.pf-chip svg{width:18px;height:18px;color:var(--orange)}
.pf-chip:hover{border-color:var(--orange)}
.pf-chip[aria-pressed="true"]{background:var(--orange);border-color:var(--orange);color:#fff}.pf-chip[aria-pressed="true"] svg{color:#fff}
.pf-chip:focus-visible{outline:2px solid var(--orange);outline-offset:2px}
.pf-hint{color:var(--muted);margin:0}
.pp{border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 30px 60px -36px rgba(34,51,69,.35);overflow:hidden}
.pp-top{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;padding:28px 30px;border-bottom:1px solid var(--line)}
.pp-top h3{font-size:clamp(24px,2.4vw,30px);margin:6px 0 4px}.pp-top p{margin:0}
.pp-price{display:flex;flex-direction:column;align-items:flex-end;gap:2px;text-align:right}
.pp-from{font-size:13px;font-weight:600;color:var(--muted)}
.pp-y{font-size:clamp(30px,3.4vw,42px);letter-spacing:-.03em;color:var(--ink);line-height:1.05;font-variant-numeric:tabular-nums}
.pp-u,.pp-m{font-size:13.5px;color:var(--muted)}
.pp-body{display:grid;grid-template-columns:1.3fr 1fr;gap:28px;padding:26px 30px}
.pp-body .ticks{columns:2;column-gap:24px}
.pp-ai{background:var(--orange-l);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:4px;align-self:start}
.pp-ai b{color:var(--orange)}.pp-ai span{font-size:14.5px}
.pp-act{display:flex;gap:20px;align-items:center;flex-wrap:wrap;padding:0 30px 28px}
.pg-h{font-size:18px;margin:8px 0 14px;display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}.pg-h span{font-size:14px;font-weight:500;color:var(--muted)}
.pcs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:28px}
.pc{display:flex;flex-direction:column;gap:6px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px;text-decoration:none;color:var(--ink);transition:transform .15s,box-shadow .15s}
.pc:hover{transform:translateY(-2px);box-shadow:0 20px 40px -26px rgba(34,51,69,.45)}
.pc-ic{width:40px;height:40px;border-radius:12px;background:var(--orange-l);color:var(--orange);display:grid;place-items:center;margin-bottom:6px}.pc-ic svg{width:20px;height:20px}
.pc b{font-size:17px}.pc-s{font-size:13.5px;color:var(--muted);min-height:2.6em}
.pc-p{font-size:24px;font-weight:700;letter-spacing:-.02em;margin-top:auto;padding-top:6px;font-variant-numeric:tabular-nums}.pc-p small{font-size:13px;font-weight:500;color:var(--muted);margin-left:4px}
.pc-f{font-size:13px;color:var(--muted);padding-bottom:6px;border-bottom:1px dashed var(--line);margin-bottom:6px}
.rt{width:100%;border-collapse:collapse;font-size:15px}
.rt th{background:var(--navy);color:#fff;text-align:left;font-size:13px;padding:12px 18px;border-top:2px solid var(--orange)}
.rt td{padding:14px 18px;border-top:1px solid var(--line);vertical-align:top}.rt td b{display:block}
.rt tr:nth-child(even) td{background:var(--bg-2)}
.rt .num{text-align:right;font-weight:700;color:var(--orange);white-space:nowrap;font-variant-numeric:tabular-nums}
.est{border:1px solid var(--line);border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:10px;background:#fff}
.est-q{margin:0;font-weight:600}
.est-btns{display:flex;gap:8px;flex-wrap:wrap}
.est-btns button{font:inherit;font-size:14px;font-weight:600;padding:8px 14px;border-radius:10px;border:1.5px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}
.est-btns button[aria-pressed="true"]{border-color:var(--orange);background:var(--orange-l);color:var(--orange)}
.est-r{margin:0;font-size:15px}.est-r b{font-size:28px;letter-spacing:-.02em;color:var(--ink)}
.ads{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.ad{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:4px}
.ad b{font-size:15.5px}.ad span{font-size:13.5px;color:var(--muted)}
@media (max-width:980px){.pcs,.ads{grid-template-columns:repeat(2,minmax(0,1fr))}.pp-body{grid-template-columns:1fr}}
@media (max-width:560px){.pcs,.ads{grid-template-columns:1fr}.pp-body .ticks{columns:1}.pp-price{align-items:flex-start;text-align:left}.pp-top,.pp-body{padding:22px}.pp-act{padding:0 22px 22px}}
"""

PRICING_JS = r"""
(function(){var btns=[].slice.call(document.querySelectorAll('[data-plan-btn]'));if(!btns.length)return;
var panels=[].slice.call(document.querySelectorAll('[data-plan]')),hint=document.querySelector('[data-plan-hint]');
function pick(k,scroll){btns.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-plan-btn')===k?'true':'false');});
panels.forEach(function(p){p.hidden=p.getAttribute('data-plan')!==k;});if(hint)hint.hidden=true;
try{localStorage.setItem('dg-plan',k);}catch(e){}
if(scroll){var p=document.querySelector('[data-plan="'+k+'"]');if(p&&p.getBoundingClientRect().top>window.innerHeight*0.7)p.scrollIntoView({behavior:'smooth',block:'center'});}}
btns.forEach(function(b){b.addEventListener('click',function(){pick(b.getAttribute('data-plan-btn'),true);});});
var s=null;try{s=localStorage.getItem('dg-plan');}catch(e){}pick(s&&document.querySelector('[data-plan="'+s+'"]')?s:'cafe',false);})();
(function(){var e=document.querySelector('[data-est]');if(!e)return;
var P={light:[15,5,1,6,3],typical:[25,10,1,12,5],heavy:[50,20,2,25,12]},R=[0.5,1.5,1,3,21];
var D={light:'15 alerts, 5 prepared actions, 1 brief and 6 questions a day',typical:'25 alerts, 10 prepared actions, 1 brief and 12 questions a day',heavy:'50 alerts, 20 prepared actions, 2 briefs and 25 questions a day'};
var v=e.querySelector('[data-est-v]'),d=e.querySelector('[data-est-d]'),bs=[].slice.call(e.querySelectorAll('[data-est-btn]'));
function set(k){var p=P[k],m=(p[0]*R[0]+p[1]*R[1]+p[2]*R[2]+p[3]*R[3])*30+p[4]*R[4];v.textContent='₹'+Math.round(m).toLocaleString('en-IN');d.textContent=D[k]+', plus '+p[4]+' deep analyses a month';
bs.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-est-btn')===k?'true':'false');});}
bs.forEach(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-est-btn'));});});set('typical');})();
(function(){var f=document.querySelector('form[data-demo]');if(!f)return;var q=new URLSearchParams(location.search),k=q.get('plan');if(!k)return;
var M={cloud:['cloud','Cloud Kitchen'],qsr:['cafes','QSR / Darshini'],cafe:['cafes','Café'],fine:['fine','Fine Dine'],smallpub:['bars','Small Pub / Bar'],pub:['bars','Pub'],largepub:['bars','Large Pub'],brewery:['bars','Brewery / Mega Venue'],quote:['','Custom quote']};
var m=M[k];if(!m)return;var t=f.querySelector('#f-type');if(t&&m[0])t.value=m[0];var h=f.querySelector('input[name="plan"]');if(h)h.value=m[1];
var ti=document.querySelector('[data-form-title]');if(ti)ti.textContent='Get a quote'+(k==='quote'?'':' for '+m[1]);
var btn=f.querySelector('button[type="submit"]');if(btn)btn.firstChild.textContent='Request my quote ';})();
"""
