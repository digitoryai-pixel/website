from core import *

# (name, colour, soft colour, icon, what it does for you, [(skill, plain explanation)])
MODS = [
 ("DigiTalk Copilot", "#D97706", "#FFF6E5", "spark", "Your assistant across every module", [
   ("Ask anything", "Questions in plain words, answered from your data"), ("Daily briefs", "8 AM summary on WhatsApp"),
   ("Cross-module insights", "Joins sales, stock and guests in one answer"), ("Role-based answers", "Each person sees only their outlets"),
   ("Anomaly alerts", "Unusual numbers flagged early"), ("Voice queries", "Ask by voice, hands free")]),
 ("AI POS", "#E5531A", "#FFF1EA", "receipt", "Faster, safer billing and service", [
   ("Menu engineering", "Shows your stars and slow movers"), ("Dynamic pricing", "Price ideas by time and demand"),
   ("Smart upsell", "Suggests add-ons at the right moment"), ("Void and fraud alerts", "Unusual voids flagged live"),
   ("Voice ordering", "Take orders by voice"), ("KDS prep timing", "Warns when a station falls behind")]),
 ("AI Inventory", "#15803D", "#EAF7EF", "box", "Food cost under control", [
   ("Demand forecast", "What you’ll sell tomorrow"), ("Auto-indent", "Orders drafted from par and forecast"),
   ("PAR optimiser", "Right stock level for every item"), ("Wastage prediction", "Stock about to expire, flagged"),
   ("Price-variance alerts", "Vendor price rises caught"), ("Invoice OCR", "Reads supplier bills from a photo")]),
 ("AI Wallet", "#2563EB", "#EAF1FE", "wallet", "Cashless payments that pay back", [
   ("Spend insights", "How guests use their balance"), ("Churn risk", "Guests likely to stop topping up"),
   ("Smart top-up offers", "The right offer to top up again"), ("Balance nudges", "Reminders to use what’s left"),
   ("Fraud detection", "Suspicious wallet activity stopped"), ("Auto-reconciliation", "Wallets matched to payments daily")]),
 ("AI Feedback", "#BE123C", "#FDECEF", "heart", "Hear every guest, act fast", [
   ("Sentiment analysis", "Happy, neutral or upset, at a glance"), ("Review reply drafts", "Replies ready for Google and Zomato"),
   ("NPS drivers", "What makes guests recommend you"), ("Theme clustering", "Top issues and praise each week"),
   ("Low-score triage", "Bad ratings sent to the manager now"), ("Staff mentions", "Who guests praise or complain about")]),
 ("AI Reservation", "#0F766E", "#E7F6F4", "calendar", "A full room, every night", [
   ("AI booking agent", "Takes bookings on WhatsApp, 24×7"), ("No-show prediction", "Spots bookings likely to skip"),
   ("Table optimiser", "Best table for every party"), ("Smart waitlist ETA", "Honest waiting times for walk-ins"),
   ("Covers forecast", "How busy tonight will be"), ("Shift auto-plan", "Staff rota from the forecast")]),
 ("AI CRM and Loyalty", "#BE185D", "#FCEBF4", "users", "Guests who keep coming back", [
   ("Predictive segments", "Groups guests by what they’ll do next"), ("Next-best offer", "The offer each guest is likely to use"),
   ("Send-time optimiser", "Sends when each guest reads"), ("AI campaign copy", "Messages written for you"),
   ("Churn prediction", "Regulars about to drift away"), ("Lifetime value", "What each guest is worth over time")]),
 ("AI Event Management", "#7C3AED", "#F2ECFD", "music", "Smooth, profitable events", [
   ("Attendance forecast", "How many will turn up"), ("Staffing plan", "Bartenders and security by hour"),
   ("Dynamic ticket pricing", "Prices that follow demand"), ("Crowd-flow insights", "Queues and hotspots, live"),
   ("Smart bundles", "Ticket and drink combos that sell"), ("Auto event recap", "Full report the next morning")]),
]
I.setdefault("calendar", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>')
I.setdefault("heart", '<path d="M12 20s-7-4.4-9-9.2C1.6 7.2 4 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4 20 4 22.4 7.2 21 10.8 19 15.6 12 20 12 20z"/>')

def eco_card(m):
    name, c, soft, icn, what, skills = m
    lis = "".join(f'<li><b>{s}</b><span>{d}</span></li>' for s, d in skills)
    return f'''<article class="eco-card" style="--c:{c};--s:{soft}"><div class="eco-h"><span class="eco-ic">{ic(icn)}</span><div><h3>{name}</h3><p>{what}</p></div></div><ul>{lis}</ul></article>'''

def eco_section(eyebrow="The Digitory AI ecosystem", title="Intelligence in every module, one assistant across them all",
                lede="Eight AI modules, each with six skills, all working on the same Digitory data. DigiTalk sits in the middle, so one question can draw on sales, stock, guests and bookings at once.", bg="", link=True):
    cards = [eco_card(m) for m in MODS]
    hub = f'''<div class="eco-hub"><span class="eco-hub-ic">{ic("spark")}</span><h3>Digitory AI core</h3>
<ul><li>One set of data: every order, recipe, guest and payment</li><li>DigiTalk: ask anything, across every module</li><li>One approvals inbox on WhatsApp and the app</li><li>Every action logged and reversible</li></ul>
<span class="eco-count"><b>8</b> AI modules · <b>48</b> skills</span></div>'''
    grid = cards[0] + cards[1] + cards[2] + cards[3] + hub + cards[4] + cards[5] + cards[6] + cards[7]
    lk = f'<p class="mt-24 center"><a class="link" href="{L("ai")}">See the AI agents at work {ARROW}</a></p>' if link else ""
    return f'''<section class="section {bg}" id="ecosystem"><div class="wrap">
<div class="head center"><span class="eyebrow">{eyebrow}</span><h2>{title}</h2><p class="lede">{lede}</p></div>
<div class="eco">{grid}</div>{lk}</div></section>'''

ECO_CSS = """
/* Ecosystem diagram */
.eco{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;position:relative}
.eco-card{background:#fff;border:1px solid var(--line);border-top:4px solid var(--c);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:14px;transition:transform .2s,box-shadow .2s}
.eco-card:hover{transform:translateY(-3px);box-shadow:0 22px 40px -24px rgba(34,51,69,.35)}
.eco-h{display:flex;gap:12px;align-items:center}
.eco-ic{width:44px;height:44px;border-radius:12px;background:var(--c);color:#fff;display:grid;place-items:center;flex:none;box-shadow:0 8px 16px -8px var(--c)}
.eco-ic svg{width:22px;height:22px}
.eco-h h3{font-size:17px;color:var(--c)}
.eco-h p{font-size:13.5px;color:var(--muted);margin-top:2px;line-height:1.35}
.eco-card ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.eco-card li{display:grid;grid-template-columns:10px minmax(0,1fr);gap:0 10px;font-size:14px;line-height:1.35}
.eco-card li::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--c);margin-top:6px;grid-row:span 2}
.eco-card li b{font-weight:600}
.eco-card li span{color:var(--muted);font-size:13px}
.eco-hub{background:var(--navy);color:#fff;border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:14px;justify-content:center;position:relative;overflow:hidden;box-shadow:0 30px 60px -30px rgba(34,51,69,.6)}
.eco-hub::before{content:"";position:absolute;inset:-40%;background:radial-gradient(circle,rgba(255,90,16,.28),transparent 55%);animation:hubpulse 4s ease-in-out infinite}
@keyframes hubpulse{50%{transform:scale(1.15);opacity:.6}}
.eco-hub>*{position:relative}
.eco-hub-ic{width:52px;height:52px;border-radius:14px;background:var(--orange);display:grid;place-items:center}
.eco-hub-ic svg{width:26px;height:26px}
.eco-hub h3{font-size:22px;color:#fff}
.eco-hub ul{margin:0;padding-left:18px;display:grid;gap:8px;font-size:14px;color:#DCE4EC}
.eco-hub li::marker{color:var(--orange)}
.eco-count{font-size:13px;color:#AABCCC;border-top:1px solid #3A5068;padding-top:12px}
.eco-count b{color:#fff;font-size:16px}
@media (max-width:980px){.eco{grid-template-columns:repeat(2,minmax(0,1fr))}.eco-hub{grid-column:1/-1;order:-1}}
@media (max-width:620px){.eco{grid-template-columns:minmax(0,1fr)}}
"""
