from core import *
from eco import eco_section
from sim import sim_section

# When each agent arrives (keep in sync with the build waves)
W1, W2, W3, W4, PL = "Dec 2026", "Early 2027", "Mid 2027", "Late 2027", "Planned"
LEVEL = {"Alert": ("Alert", "#2563EB", "#EAF1FE"), "Propose": ("Propose", "#C2410C", "#FFF1EA"),
         "Act": ("Acts within limits", "#11845B", "#E9F7F0"), "Answer": ("Answers", "#6D28D9", "#F2ECFD")}

# key, title, colour, list of (agent, what it does, level, when)
GROUPS = [
 ("owner", "Owner and HQ", "#F59E0B", [
   ("Morning brief", "8 AM on WhatsApp: yesterday’s sales and food cost, what went wrong, what needs your approval, one suggestion.", "Answer", W1),
   ("Ask anything", "Ask about any outlet, any module, in plain words. Numbers match your Digitory reports.", "Answer", W1),
   ("Approvals inbox", "Every agent’s proposals in one place. Approve or reject from WhatsApp or the app.", "Propose", W1)]),
 ("pos", "POS and billing", "#F05A0F", [
   ("Shift watch", "Flags unusual voids, no-charge bills, discounts and reprints by staff, live during service, with the bills behind it.", "Alert", W1),
   ("Day close", "Before closing: open bills, cash differences and unsettled UPI or card payments, with the close prepared for the manager.", "Propose", PL),
   ("Billing error guard", "Catches wrong tax setup and GST or e-invoice errors on items before they reach a bill.", "Alert", PL)]),
 ("menu", "Menu", "#F05A0F", [
   ("Menu change", "“Add Paneer Roll at ₹240, like Chicken Roll” becomes a preview you approve with one tap.", "Propose", W1),
   ("Menu health", "Missing taxes or recipes, duplicate items and price mismatches across outlets, with the fixes ready.", "Propose", W1),
   ("Menu engineering", "Finds your stars and slow movers from sales and plate cost, and suggests price changes and promotions.", "Propose", PL)]),
 ("kitchen", "Kitchen", "#F05A0F", [
   ("Kitchen pace", "“Tandoor averaging 18 minutes, 6 tickets waiting.” Live prep times by station.", "Alert", PL),
   ("Routing fix", "Spots items going to the wrong station or printer and proposes the fix.", "Propose", PL),
   ("Prep forecast", "“Prep 40 biryani and 25 kebab portions tomorrow”, from history, weekday and events.", "Propose", W4)]),
 ("inventory", "Inventory and recipes", "#16A34A", [
   ("Reorder", "Drafts tomorrow’s purchase order from par levels, forecast and open orders. Your store manager approves.", "Propose", W2),
   ("Variance and theft", "“Chicken 8% over recipe at HSR, mostly Saturday night.” Actual against expected usage.", "Alert", W2),
   ("Recipe cost drift", "“Paneer up 12%: 6 dishes lost over 3 points of margin.” Hands over to menu engineering.", "Alert", W2),
   ("Expiry and waste", "Stock close to expiry, with specials or transfers proposed to use it up.", "Propose", PL)]),
 ("buying", "Purchasing and vendors", "#16A34A", [
   ("Vendor price watch", "Delivered price against the order or contract price, and price creep by vendor.", "Alert", PL),
   ("Best vendor", "Picks the vendor for each order line on price, fill rate and on-time delivery.", "Propose", PL),
   ("Delivery check", "Matches delivery notes to orders and invoices, and drafts the short-supply claim.", "Propose", PL)]),
 ("ck", "Central kitchen", "#16A34A", [
   ("Outlet indent", "Drafts each outlet’s indent to the central kitchen from its sales forecast.", "Propose", W3),
   ("Production plan", "Combines every indent into the central kitchen’s production plan.", "Propose", W3),
   ("Stock balancing", "Stock idle at one outlet while another runs out? It proposes the transfer.", "Propose", PL)]),
 ("crm", "Guests and marketing", "#DB2777", [
   ("Win-back", "Finds regulars who stopped coming and drafts a WhatsApp offer. You approve the list and the message.", "Propose", W2),
   ("Quiet-day campaign", "“Slow Tuesday lunches at Koramangala” becomes a targeted offer with the expected return.", "Propose", PL),
   ("Guest memory", "For captains: “Regular, window seat, usual Hefeweizen.” Shared only with the guest’s consent.", "Answer", PL)]),
 ("feedback", "Feedback and reviews", "#E11D48", [
   ("Review replies", "Drafts replies to Google and Zomato reviews for the manager to approve.", "Propose", W2),
   ("Complaint recovery", "A bad rating alerts the manager and drafts an apology and recovery offer, ideally while the guest is still in.", "Propose", PL),
   ("Weekly themes", "“Slow service at weekends: 14 mentions. Cold food: 6.”", "Alert", PL)]),
 ("res", "Reservations and tables", "#0D9488", [
   ("Booking agent", "Answers booking requests on WhatsApp and books within your rules. Large groups go to the manager.", "Act", W4),
   ("No-show guard", "Reminders, deposits for large groups and overbooking within the limits you set.", "Propose", PL),
   ("Table turn", "Flags long-sitting tables at peak and suggests seating.", "Alert", PL)]),
 ("online", "Online orders and aggregators", "#2563EB", [
   ("AI assistant ordering", "Guests order from your own menu through ChatGPT, Claude or Google, with no commission.", "Act", W4),
   ("Aggregator sync", "Items out of sync with Swiggy or Zomato, unmapped items, price mismatches, outlet offline.", "Alert", PL),
   ("Commission check", "Aggregator payouts against orders: wrong commission and missing payouts.", "Alert", W3)]),
 ("events", "Wallets and events", "#9333EA", [
   ("Event live", "Live revenue, top-ups and queues at each bar, and which counters to open.", "Alert", W3),
   ("Refunds and matching", "Unspent balances, refund batches, and gateway against wallet matching.", "Propose", W3),
   ("Event report", "The full event report, ready the next morning.", "Answer", W3)]),
 ("money", "Payments, accounts and compliance", "#2563EB", [
   ("Payment matching", "UPI, card and wallet settlements against bills, with each mismatch explained.", "Propose", W3),
   ("Tally posting", "Daily sales, purchase and tax entries prepared for Tally. Your accountant approves.", "Propose", W3),
   ("Compliance watch", "E-invoice failures, GST rate changes, bar excise registers and guest-consent gaps.", "Alert", PL)]),
]
G = {k: (t, c, a) for k, t, c, a in GROUPS}
COUNT = sum(len(a) for _, _, _, a in GROUPS)

def lvl(l):
    t, fg, bg = LEVEL[l]
    return f'<span class="lvl" style="color:{fg};background:{bg}">{t}</span>'

def agent_rows(agents):
    return "".join(f'<li class="agent"><div class="agent-top"><b>{n}</b>{lvl(l)}</div><p>{d}</p></li>' for n, d, l, w in agents)

def group_card(k):
    t, c, a = G[k]
    return f'<div class="card agent-card"><div class="agent-head"><span class="sq" style="background:{c}"></span><h3>{t}</h3></div><ul class="agents">{agent_rows(a)}</ul></div>'

def pick(names):
    allag = {x[0]: x for _, _, _, ags in GROUPS for x in ags}
    return [allag[n] for n in names]

def ai_band(names, title, lede):
    """Subtle, light band: short pitch on the left, one card of hand-picked agents on the right."""
    return f'''<section class="section tight ai-band" id="ai"><div class="wrap"><div class="ai-strip">
<div class="ai-strip-copy"><span class="eyebrow">AI built in</span><h2 style="font-size:clamp(26px,3vw,36px)">{title}</h2><p class="muted">{lede}</p>
<a class="link" href="{L("ai")}">Meet all the AI agents {ARROW}</a></div>
<div class="card agent-card"><ul class="agents">{agent_rows(pick(names))}</ul></div></div></div></section>'''

def inbox(compact=False):
    items = [("#F05A0F", "Shift watch", "Alert", "Ravi voided 9 bills worth ₹6,400 tonight, 4× his usual.", "View bills"),
             ("#16A34A", "Reorder", "Propose", "Tomorrow’s order: 14 items, ₹38,450 from 3 vendors.", "Approve"),
             ("#DB2777", "Win-back", "Propose", "312 regulars haven’t visited in 30 days. Offer drafted.", "Review"),
             ("#0D9488", "Booking agent", "Act", "Confirmed 6 tables for tonight on WhatsApp.", "See list")]
    if compact: items = items[:3]
    rows = "".join(f'''<li class="inbox-row"><span class="sq" style="background:{c}"></span><div class="inbox-txt"><div class="agent-top"><b>{n}</b>{lvl(l)}</div><p>{t}</p></div><span class="inbox-btn">{b}</span></li>''' for c, n, l, t, b in items)
    return f'''<div class="inbox" role="img" aria-label="Example approvals inbox: a shift alert, a reorder to approve, a win-back campaign and bookings confirmed by agents">
<div class="chat-top"><span class="av">{ic("spark")}</span><div><b>Your AI team</b><span>Today · 4 updates</span></div></div><ul>{rows}</ul></div>'''

AI_FAQ = [
 ("What is an AI agent?", "A digital teammate that looks after one job, such as reordering stock or replying to reviews. It watches your Digitory data, spots what needs doing, prepares the work and, with your OK, gets it done."),
 ("How is that different from DigiTalk?", "DigiTalk is how you talk to Digitory’s AI: you ask a question and it answers. Agents work in the background on their own jobs and come to you when something needs a decision."),
 ("Can an agent change things without asking me?", "Only if you allow it, and only within limits you set, such as booking tables for up to six people. Everything else is a proposal you approve, and every change can be undone."),
 ("Do I need new hardware or software?", "No. Agents work inside Digitory, on the data already in your account, and reach you on WhatsApp and in the Digitory app."),
 ("Is my data safe?", "Agents follow the same roles and outlet access as your team. Guest phone numbers stay masked, and guest data is used only with consent."),
 ("Which agents do I get?", "All agents run on the Digitory modules you use. If you use POS and inventory, for example, you get the POS, kitchen, menu, inventory and purchasing agents."),
]

def ai_page():
    explain = [("chart", "Ordinary software", "Shows you reports. You still have to find the problem and fix it yourself."),
               ("spark", "An assistant", "Answers when you ask. Helpful, but only if you know what to ask."),
               ("check", "An AI agent", "Watches its job all day, tells you what needs doing, prepares the work and does it once you approve.")]
    ex = "".join(f'<div class="card{" hl" if i == 2 else ""}">{icon_box(n, i == 2)}<h3>{t}</h3><p class="muted">{d}</p></div>' for i, (n, t, d) in enumerate(explain))
    levels = [("Alert", "Spots something and tells the right person, with the evidence.", "“Ravi voided 9 bills worth ₹6,400 tonight, 4× his usual.”"),
              ("Propose", "Prepares the work. Nothing changes until a person approves with one tap, and every change can be undone.", "The reorder agent drafts tomorrow’s purchase order; the store manager approves it."),
              ("Act", "Does the job itself inside rules you set, and reports what it did.", "The booking agent confirms tables of up to 6 on WhatsApp; bigger groups go to the manager.")]
    lv = "".join(f'<div class="card level"><div>{lvl(k)}</div><p style="font-size:17px">{d}</p><p class="muted small" style="border-top:1px solid var(--line);padding-top:12px">{e}</p></div>' for k, d, e in levels)
    day = [("8:00 AM", "Morning brief", "Yesterday’s numbers and three things to do today arrive on WhatsApp."),
           ("10:30 AM", "Reorder", "Tomorrow’s purchase order is ready. The store manager approves it in one tap."),
           ("1:15 PM", "Kitchen pace", "Tandoor tickets are running 18 minutes. The head chef gets a heads-up."),
           ("4:00 PM", "Quiet-day campaign", "Tuesday looks slow. An offer to weekday regulars waits for your OK."),
           ("7:30 PM", "Booking agent", "Six WhatsApp booking requests confirmed; one group of 12 passed to the manager."),
           ("10:45 PM", "Shift watch", "Unusual voids on one terminal. The manager sees the bills behind it."),
           ("11:50 PM", "Day close", "Open bills and unsettled payments listed, and the close prepared.")]
    day_html = '<ol class="day">' + "".join(f'<li><span class="t">{t}</span><div><b>{n}</b><p class="muted">{d}</p></div></li>' for t, n, d in day) + '</ol>'
    plays = [("Price spike to menu", ["Inventory", "Menu"], "Paneer price jumps. The cost agent spots the margin loss and the menu agent proposes a new price or a swap."),
             ("Fill the quiet days", ["POS", "Guests"], "Sales history shows a slow Tuesday. The campaign agent offers it to regulars who come on weekdays."),
             ("Cook for the forecast", ["Reservations", "Kitchen", "Inventory"], "Tomorrow’s bookings and events shape the prep list and the purchase order."),
             ("Feedback rescue", ["Feedback", "Guests"], "A 2-star rating comes in. The manager gets the bill, the dish and a recovery offer within a minute."),
             ("Know the guest at the door", ["Reservations", "Guests"], "The host sees it’s a regular, their usual table and their usual drink."),
             ("True outlet profit", ["POS", "Inventory", "Tally"], "Sales, food cost and expenses come together in one profit number per outlet.")]
    pl = "".join(f'<div class="card"><div class="chips">{"".join(f"<span class=chip>{m}</span>" for m in mods)}</div><h3>{t}</h3><p class="muted">{d}</p></div>' for t, mods, d in plays)
    groups = "".join(group_card(k) for k, _, _, _ in GROUPS)
    waves = [("Dec 2026", "Owner essentials", "Morning brief, ask anything, approvals inbox, shift watch, menu change and menu health."),
             ("Early 2027", "Food cost and repeat guests", "Reorder, variance and theft, recipe cost drift, review replies and win-back."),
             ("Mid 2027", "Money and multi-outlet", "Payment matching, aggregator commission checks, Tally posting, central kitchen and event agents."),
             ("Late 2027", "Guest-facing agents", "Booking agent, prep forecast, and ordering through ChatGPT, Claude and Google.")]
    wv = "".join(f'<li><b class="accent">{a}</b><h3>{b}</h3><p class="muted">{c}</p></li>' for a, b, c in waves)
    body = f'''<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="{L("home")}">Home</a> / <span aria-current="page">AI agents</span></nav>
<span class="eyebrow">The Digitory agentic platform</span><h1>An AI team for every part of your restaurant</h1>
<p class="lede">Digitory’s AI agents are digital teammates. Each one looks after a single job, like reordering stock or catching unusual voids. It spots what needs doing, prepares the work and gets it done once you say yes.</p>
<div class="actions"><a class="btn btn-primary" href="{L("demo")}">Book a demo {ARROW}</a><a class="btn btn-ghost" href="#agents">Meet the {COUNT} agents</a></div>
<div class="hero-proof"><span>{COUNT} agents, 13 areas</span><span>You approve every change</span><span>Works on WhatsApp</span></div></div>
<div>{inbox()}</div></div></section>
<section class="section bg-soft"><div class="wrap">
<div class="head"><span class="eyebrow">In 30 seconds</span><h2>What makes an agent different</h2><p class="lede">Most restaurant software waits for you to look at it. An agent comes to you.</p></div>
<div class="grid g3 explain">{ex}</div></div></section>
{sim_section("", "Watch the agents work at your venue", None, "")}
<section class="section"><div class="wrap">
<div class="head"><span class="eyebrow">How every agent works</span><h2>Three levels of trust</h2><p class="lede">Every agent starts by alerting or proposing. It only acts on its own once it has proven itself, and only within the limits you set.</p></div>
<div class="grid g3">{lv}</div></div></section>
<section class="section bg-soft"><div class="wrap split" style="align-items:start">
<div style="display:flex;flex-direction:column;gap:20px;position:sticky;top:110px"><span class="eyebrow">A day with your AI team</span><h2>What actually happens on a Tuesday</h2><p class="lede">You don’t open seven reports. The right person gets the right nudge at the right time, and most of it takes one tap.</p>
<img src="{A("digo.webp")}" alt="DIGO, the Digitory mascot" width="160" height="160" loading="lazy" style="width:150px"></div>
<div>{day_html}</div></div></section>
<section class="section" id="agents"><div class="wrap">
<div class="head"><span class="eyebrow">Meet the agents</span><h2>{COUNT} agents across 13 areas of your business</h2><p class="lede">Each card shows what the agent does and how much it does on its own.</p>
<div class="chips">{lvl("Alert")}{lvl("Propose")}{lvl("Act")}{lvl("Answer")}</div></div>
<div class="grid g3">{groups}</div></div></section>
<section class="section bg-navy"><div class="wrap">
<div class="head"><span class="eyebrow">Agents that work together</span><h2>A chatbot on a billing app can’t do this</h2><p class="lede">Because your POS, kitchen, stock, guests and accounts live in one Digitory, agents can pass work to each other across modules.</p></div>
<div class="grid g3">{pl}</div></div></section>
{eco_section(link=False)}
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">Safe by design</span><h2>You stay in charge</h2></div>
<div class="grid g4">
<div class="card">{icon_box("check")}<h3>Approve or ignore</h3><p class="muted">Proposals show the old and new value. Nothing changes until you tap approve.</p></div>
<div class="card">{icon_box("layers")}<h3>Undo anything</h3><p class="muted">Every applied change can be reversed in one tap.</p></div>
<div class="card">{icon_box("users")}<h3>Same access as your team</h3><p class="muted">Agents see only the outlets and data the person they work for can see.</p></div>
<div class="card">{icon_box("shield")}<h3>A full record</h3><p class="muted">What each agent suggested, who approved it and what changed, kept in your account.</p></div>
</div></div></section>''' + faq_html(AI_FAQ, "Questions about AI agents") + cta("See the AI team working on a menu like yours", "We’ll show you the agents that matter most for your venue, and how approvals work on WhatsApp.")
    ld = [crumbs_ld([("Home", "home"), ("AI agents", "ai")]), faq_ld(AI_FAQ)]
    return doc("ai", "AI Agents for Restaurants | Digitory Agentic Platform",
               f"Meet Digitory’s {COUNT} AI agents for restaurants: reorder, shift watch, win-back, review replies, booking and more. They prepare the work; you approve it.", body, ld)

AI_CSS = """
/* AI agents */
.lvl{display:inline-block;font-size:11.5px;font-weight:600;letter-spacing:.02em;padding:3px 10px;border-radius:999px;white-space:nowrap}
.agent-card{gap:16px}
.agent-head{display:flex;align-items:center;gap:12px}
.sq{width:14px;height:14px;border-radius:4px;flex:none}
.agents{list-style:none;margin:0;padding:0;display:grid}
.agent{padding:14px 0;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:6px}
.agent-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.agent-top b{font-weight:600;font-size:16px}
.agent p{font-size:14.5px;line-height:1.55;color:var(--muted);margin:0}
.when{font-size:12px;font-weight:600;color:var(--soft);text-transform:uppercase;letter-spacing:.06em}
.ai-strip{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(28px,5vw,64px);align-items:center;background:linear-gradient(135deg,#FFF6F1,#F5F7FA);border:1px solid #FFE1D2;border-radius:28px;padding:clamp(24px,4vw,48px)}
.ai-strip-copy{display:flex;flex-direction:column;gap:16px}
.ai-band .agent-card{box-shadow:0 24px 48px -28px rgba(34,51,69,.35)}
.ai-band .agent:first-child{border-top:0;padding-top:0}
@media (max-width:860px){.ai-strip{grid-template-columns:minmax(0,1fr)}}
.nav-new{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--orange);color:#fff;border-radius:999px;padding:2px 7px;margin-left:2px}
.inbox{background:#fff;border:1px solid var(--line);border-radius:22px;overflow:hidden;box-shadow:0 40px 80px -24px rgba(34,51,69,.3)}
.inbox ul{list-style:none;margin:0;padding:6px 18px 12px}
.inbox-row{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:14px;align-items:start;padding:16px 0;border-top:1px solid var(--line)}
.inbox-row:first-child{border-top:0}
.inbox-row .sq{margin-top:5px}
.inbox-txt p{margin:4px 0 0;font-size:14.5px;color:var(--muted);line-height:1.5}
.inbox-btn{font-size:13px;font-weight:600;color:var(--orange);border:1.5px solid #FFD2BC;border-radius:9px;padding:6px 12px;white-space:nowrap;margin-top:2px}
@media (max-width:480px){.inbox-row{grid-template-columns:14px minmax(0,1fr)}.inbox-btn{grid-column:2;justify-self:start}}
.explain .hl{border-color:var(--orange);box-shadow:0 0 0 3px rgba(255,90,16,.12)}
.level{gap:14px}
.day{list-style:none;margin:0;padding:0;position:relative}
.day::before{content:"";position:absolute;left:88px;top:8px;bottom:8px;width:2px;background:#E1E7EE}
.day li{display:grid;grid-template-columns:80px minmax(0,1fr);gap:28px;padding:14px 0;position:relative}
.day li::before{content:"";position:absolute;left:83px;top:22px;width:12px;height:12px;background:var(--orange);border:3px solid var(--bg-2);border-radius:4px}
.day .t{font-weight:600;font-size:14px;color:var(--muted);padding-top:2px;font-variant-numeric:tabular-nums}
.day b{font-size:17px;font-weight:600}
@media (max-width:900px){.split>div[style*="sticky"]{position:static!important}}
.waves{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:16px;counter-reset:w}
.waves li{background:#fff;border-radius:16px;padding:24px;border:1px solid #FFD9C6;display:flex;flex-direction:column;gap:8px}
.waves b{font-size:14px;letter-spacing:.04em}
"""
