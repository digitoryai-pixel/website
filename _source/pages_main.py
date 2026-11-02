from core import *
from eco import eco_section
from sim import venue_picker

# ======================= HOME =======================
HOME_FAQ = [
 ("Does Digitory keep billing if the internet goes down?", "Yes. The POS keeps taking orders, printing KOTs and generating bills offline, and syncs to the cloud when the connection is back."),
 ("Does it work with Swiggy and Zomato?", "Yes. Delivery orders arrive in the same queue as dine-in and QR orders, go straight to the kitchen, and deduct stock like any other sale."),
 ("Is Digitory GST-ready?", "Yes. Taxes are set per item and per outlet, bills carry the right GST breakup, and reports are ready for your accountant. Tally export is supported."),
 ("Can I manage several outlets from one login?", "Yes. You see every outlet on one dashboard, compare them side by side, and control menus, prices and staff access centrally."),
 ("How long does it take to go live?", "It depends on your menu and the modules you choose. Our onboarding team sets up your menu, taxes, printers and staff, and trains your team before day one."),
 ("What hardware do I need?", "Digitory runs on standard billing terminals, Android tablets and thermal printers. We will tell you what you can reuse and what you need, before you buy anything."),
]

def home():
    from hero import home_hero
    hero = home_hero()

    logos = '<section class="section tight" aria-label="Customers"><div class="wrap"><div class="logos"><span class="lbl">Trusted by some of the busiest venues in hospitality</span>' + "".join(f"<span>{c}</span>" for c in CLIENTS) + '</div></div></section>'

    pa = [
     ("The kitchen never got the order.", "Every order lands in the right place", "Dine-in, QR, Swiggy and Zomato orders go to the right kitchen screen or printer the moment they are placed. Nothing is re-typed, nothing is lost on a slip of paper."),
     ("Sales were normal, so why is stock short?", "Stock that matches sales, every day", "Each bill deducts its recipe from stock. Variance, wastage and missing bottles show up the next morning, not at month-end."),
     ("We only find out about a bad month after it ends.", "Numbers you can act on today", "Live sales, food cost and outlet comparisons on your phone, and a short morning summary of what needs attention."),
    ]
    pa_html = "".join(f'<div class="pa-row"><p class="pa-q">{q}</p><div class="pa-a"><span class="tag">With Digitory</span><h3>{h}</h3><p class="muted">{t}</p></div></div>' for q, h, t in pa)
    problems = f'''<section class="section bg-soft"><div class="wrap">
<div class="head"><span class="eyebrow">Sound familiar?</span><h2>Most restaurant problems start where two systems don’t talk</h2>
<p class="lede">Billing in one app, stock in a spreadsheet, delivery on three tablets and guests in a notebook. Digitory puts them in one place, so every order updates everything it touches.</p></div>
<div class="pa">{pa_html}</div></div></section>'''

    plat = "".join(f'<a class="card" href="{L(s)}">{icon_box(i)}<span class="eyebrow" style="font-size:12px">{k}</span><h3>{t}</h3><p class="muted">{d}</p><span class="link">Learn more {ARROW}</span></a>' for s, i, k, t, d in PLATFORM)
    platform = f'''<section class="section" id="platform"><div class="wrap">
<div class="head"><span class="eyebrow">One platform</span><h2>From the first order to the final report</h2>
<p class="lede">Twelve modules that share one menu, one stock ledger and one guest list. Start with what you need and switch on the rest when you’re ready.</p></div>
<div class="grid g4">{plat}</div></div></section>'''

    spotlight = f'''<section class="section bg-soft"><div class="wrap split">
<div class="card" style="padding:0;overflow:hidden;box-shadow:0 40px 80px -30px rgba(34,51,69,.3)" role="img" aria-label="Example outlet comparison: sales, change on last week, food cost and voids for four outlets">
<div style="padding:18px 22px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center"><b>Outlets today</b><span class="small muted">Live · example</span></div>
<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px;min-width:420px;font-variant-numeric:tabular-nums">
<thead><tr style="text-align:left;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em"><th style="padding:12px 22px;font-weight:600">Outlet</th><th style="padding:12px 8px;font-weight:600">Sales</th><th style="padding:12px 8px;font-weight:600">vs last wk</th><th style="padding:12px 8px;font-weight:600">Food cost</th><th style="padding:12px 22px 12px 8px;font-weight:600">Voids</th></tr></thead>
<tbody>
<tr style="border-top:1px solid var(--line)"><td style="padding:14px 22px;font-weight:600">Indiranagar</td><td style="padding:14px 8px">₹1.42L</td><td style="padding:14px 8px" class="up">+9%</td><td style="padding:14px 8px">29%</td><td style="padding:14px 22px 14px 8px">2</td></tr>
<tr style="border-top:1px solid var(--line)"><td style="padding:14px 22px;font-weight:600">Koramangala</td><td style="padding:14px 8px">₹1.18L</td><td style="padding:14px 8px" class="up">+4%</td><td style="padding:14px 8px">31%</td><td style="padding:14px 22px 14px 8px">1</td></tr>
<tr style="border-top:1px solid var(--line);background:#FFF8F4"><td style="padding:14px 22px;font-weight:600">Whitefield</td><td style="padding:14px 8px">₹0.86L</td><td style="padding:14px 8px" class="down">−12%</td><td style="padding:14px 8px" class="down">36%</td><td style="padding:14px 22px 14px 8px" class="down">7</td></tr>
<tr style="border-top:1px solid var(--line)"><td style="padding:14px 22px;font-weight:600">HSR Layout</td><td style="padding:14px 8px">₹0.97L</td><td style="padding:14px 8px" class="up">+2%</td><td style="padding:14px 8px">30%</td><td style="padding:14px 22px 14px 8px">1</td></tr>
</tbody></table></div>
<div style="padding:14px 22px;background:var(--bg-2);font-size:14px;display:flex;gap:10px;align-items:center"><span style="color:var(--orange);display:inline-flex;width:18px">{ic("bell")}</span>Whitefield: 7 voids since 6 PM, all on one terminal.</div></div>
<div style="display:flex;flex-direction:column;gap:24px">
  <span class="eyebrow">For owners and managers</span><h2>Every outlet on one screen</h2>
  <p class="lede">Open the dashboard at 2 PM or 2 AM and see exactly what is happening: what’s selling, what’s running out and who is on shift.</p>
  <ul class="ticks"><li><span><b>Live sales by outlet, channel and hour</b>, with comparisons to last week.</span></li>
  <li><span><b>Food cost and variance</b> from real recipes, not estimates.</span></li>
  <li><span><b>Voids, discounts and cancellations</b> with who approved them.</span></li>
  <li><span><b>Staff on shift</b> and table occupancy in real time.</span></li></ul>
  <a class="link" href="{L("platform")}">See all reports {ARROW}</a>
</div></div></section>'''

    from agents import inbox
    ai = f'''<section class="section bg-navy"><div class="wrap split rev">
<div>{inbox()}</div>
<div style="display:flex;flex-direction:column;gap:24px">
  <span class="eyebrow">AI agents</span><h2>An AI team that works every shift</h2>
  <p class="lede">Digitory’s AI agents each look after one job: reordering stock, catching unusual voids, bringing back lapsed regulars, confirming bookings. They prepare the work and you approve it with one tap on WhatsApp or the app.</p>
  <ul class="ticks"><li><span><b>They come to you.</b> No reports to dig through.</span></li><li><span><b>You stay in charge.</b> Nothing changes without your OK, and everything can be undone.</span></li><li><span><b>Ask anything with DigiTalk,</b> the assistant that ties them together.</span></li></ul>
  <div class="actions"><a class="btn btn-primary" href="{L("ai")}">Meet the AI agents {ARROW}</a></div>
</div></div></section>'''

    sols = f'''<section class="section"><div class="wrap">
<div class="head"><span class="eyebrow">Built for your venue</span><h2>A brewery and a cloud kitchen don’t run the same way</h2>
<p class="lede">Digitory comes set up for how your kind of venue works, with the reports and controls that matter to it.</p></div>
{solution_cards()}</div></section>'''

    why = [
     ("wifi", "Keeps billing when the internet drops", "Orders, KOTs and bills carry on offline and sync when you’re back online. Friday night doesn’t depend on your broadband."),
     ("globe", "Made for local tax and trade", "Taxes, currency and payment methods are set per outlet, so each location follows its own rules. In India that means GST, e-invoicing, bar excise, UPI, Swiggy and Zomato, built in."),
     ("layers", "One system, one login", "Billing, kitchen, stock, purchase, guests and reports share one menu and one set of numbers. No exports between apps."),
     ("hand", "People who know restaurants", "Our team sets up your menu, printers and staff, trains your crew, and stays a phone call away after launch."),
    ]
    why_html = "".join(f'<div class="card">{icon_box(i)}<h3>{t}</h3><p class="muted">{d}</p></div>' for i, t, d in why)
    whys = f'''<section class="section bg-soft"><div class="wrap">
<div class="head"><span class="eyebrow">Why Digitory</span><h2>Built for busy service, at any scale</h2></div>
<div class="grid g4">{why_html}</div></div></section>'''

    quotes = "".join(f'''<figure class="quote"><span class="placeholder">Replace with an approved client quote</span><blockquote>“[What changed for this venue after moving to Digitory, in the owner’s own words.]”</blockquote><figcaption><span class="ph" aria-hidden="true"></span><span><b>[Name]</b>[Role], [Venue]</span></figcaption></figure>''' for _ in range(3))
    testi = f'''<section class="section"><div class="wrap">
<div class="head"><span class="eyebrow">Customers</span><h2>What operators say</h2></div>
<div class="grid g3">{quotes}</div>
<p class="mt-24"><a class="link" href="{L("customers")}">Read customer stories {ARROW}</a></p></div></section>'''

    from sim import sim_section
    from managed import mi_band
    import re as _re
    def chap(html, n, label, anchor):
        html = _re.sub(r'<span class="eyebrow">[^<]*</span>', f'<span class="eyebrow chap"><b>{n:02d}</b>{label}</span>', html, count=1)
        html = _re.sub(r'<section class="([^"]*)"( id="[^"]*")?', lambda m: f'<section class="{m.group(1)}" id="{anchor}" data-chap="{n:02d}" data-chap-label="{label}"', html, count=1)
        return html

    steps = [
     ("layers", "One platform", "Billing, kitchen, stock, purchase, guests and reports share one menu and one set of numbers. Every order updates everything it touches.",
      '<div class="hw-chips"><span>POS</span><span>Kitchen</span><span>Inventory</span><span>Recipes</span><span>Guests</span><span>Reports</span></div>', "#platform", "See the platform"),
     ("spark", "AI agents watch it all", "Agents work every shift on that live data: low stock, unusual voids, rising food cost, regulars who stopped coming. They prepare the fix before you ask.",
      '<div class="hw-toast"><span class="hw-dot"></span><span><b>Stock agent</b>Chicken runs out by 8 PM. Draft order ready.</span></div>', "#experience", "Watch them at your venue"),
     ("check", "You approve. It's done.", "Nothing changes without your one-tap OK on WhatsApp or the app. Approve, edit or skip, and every action can be undone.",
      '<div class="hw-ok"><span class="hw-btn">Approve</span><span class="hw-btn ghost">Edit</span><span class="hw-btn ghost">Skip</span></div>', L("ai"), "Meet the AI agents"),
    ]
    hw = "".join(f'''<li class="hw-step"><span class="hw-n">{i+1}</span><div class="hw-ic">{ic(icn)}</div><h3>{t}</h3><p class="muted">{d}</p>{vis}<a class="link" href="{href}">{cta_t} {ARROW}</a></li>''' for i, (icn, t, d, vis, href, cta_t) in enumerate(steps))
    how = f'''<section class="section how"><div class="wrap">
<div class="head center"><span class="eyebrow">How Digitory works</span><h2>One platform. AI on top. You in charge.</h2>
<p class="lede">Here is the whole idea in three steps. Each chapter below shows one of them in action.</p></div>
<ol class="hw">{hw}</ol></div></section>'''

    chapters = [
      (how, "How it works", "how"),
      (platform, "The platform", "platform"),
      (sim_section(title="Watch the AI agents run a day at your venue"), "AI agents in action", "experience"),
      (sols, "Built for your venue", "venues"),
      (whys, "Why Digitory", "why"),
      (testi, "Customers", "customers"),
    ]
    story = "".join(chap(h, i+1, lbl, a) for i, (h, lbl, a) in enumerate(chapters))
    short = ["How it works", "Platform", "AI agents", "Your venue", "Why Digitory", "Customers"]
    stations = "".join(f'<li><a href="#{a}" data-stop="{i+1:02d}"><span class="rm-node"><b>{i+1:02d}</b></span><span class="rm-lbl">{short[i]}</span></a></li>' for i, (h, lbl, a) in enumerate(chapters))
    rail = f'''<nav class="routemap" aria-label="Jump to a section" data-routemap><div class="wrap rm-in">
<span class="rm-now" aria-hidden="true"><span class="rm-k">You are here</span><b data-rm-now>Start</b></span>
<div class="rm-scroll"><ol class="rm-track"><span class="rm-line" aria-hidden="true"><i data-rm-fill></i></span>{stations}</ol></div></div></nav>'''
    body = rail + hero + logos + story + faq_html(HOME_FAQ) + cta()
    ld = [{"@type": "WebSite", "@id": DOMAIN + "/#website", "url": DOMAIN, "name": "Digitory", "publisher": {"@id": DOMAIN + "/#org"}, "inLanguage": "en"},
          {"@type": "SoftwareApplication", "name": "Digitory", "applicationCategory": "BusinessApplication", "applicationSubCategory": "Restaurant POS and management software",
           "operatingSystem": "Web, Android, Windows", "publisher": {"@id": DOMAIN + "/#org"}, "offers": {"@type": "Offer", "priceCurrency": "INR", "url": url("demo")}},
          faq_ld(HOME_FAQ)]
    return doc("home", "Digitory | AI-Powered Restaurant POS & Management Platform",
               "Billing, kitchen display, inventory, CRM and reports in one system for restaurants, bars, breweries and cloud kitchens. Works offline. Trusted by 1,000+ clients.",
               body, ld)

# ======================= PLATFORM =======================
def platform():
    groups = [
     ("Sell", "receipt", "pos", [("POS and billing", "Dine-in, takeaway and delivery billing with split bills, tiered pricing and happy hours."), ("Kitchen display (KDS)", "Orders routed to each station, with prep timers and ready alerts."), ("QR ordering", "Guests order and pay from the table. Orders go straight to the kitchen."), ("Delivery orders", "Swiggy and Zomato in the same queue as every other order.")]),
     ("Stock", "box", "inventory", [("Inventory", "Live stock that updates with every sale, transfer and wastage entry."), ("Recipes and costing", "Plate cost for every dish, updated when purchase prices change."), ("Purchasing", "Indents, purchase orders, goods receipt and vendor price history."), ("Central kitchen", "Production plans and transfers to outlets, with full traceability.")]),
     ("Guests", "users", "guests", [("CRM and loyalty", "Guest profiles from every bill, points, tiers and targeted offers."), ("Reservations", "Bookings, table plans and waitlists that know your regulars."), ("Feedback", "Ratings tied to the bill, the dish and the server."), ("Wallets and events", "Cashless wallets, ticketing and entry with Obvvy.")]),
     ("Know", "chart", "digitalk", [("Live reports", "Sales, food cost, staff and channel reports for every outlet."), ("Multi-outlet control", "Central menus, prices, roles and permissions."), ("Accounts", "GST-ready reports and Tally export for your accountant."), ("DigiTalk AI", "Ask questions in plain words and get a daily action list.")]),
    ]
    blocks = ""
    for title, icn, slug, mods in groups:
        cards = "".join(f'<div class="card"><h3>{t}</h3><p class="muted">{d}</p></div>' for t, d in mods)
        blocks += f'''<div class="mt-40"><div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">{icon_box(icn, True)}<h2 style="font-size:clamp(24px,2.6vw,32px)">{title}</h2><a class="link" style="margin-left:auto" href="{L(slug)}">Details {ARROW}</a></div><div class="grid g4">{cards}</div></div>'''
    flow = [("Order taken", "At the table, counter, QR or delivery app."), ("Kitchen notified", "On the right screen or printer, instantly."), ("Stock deducted", "Recipe quantities leave inventory."), ("Guest remembered", "The visit adds to their profile and points."), ("Numbers updated", "Sales, cost and margin, live.")]
    flow_html = '<ol class="flow" style="padding:0;margin:0">' + "".join(f"<li><b>{a}</b><span>{b}</span></li>" for a, b in flow) + "</ol>"
    body = page_hero([("Home", "home"), ("Platform", "platform")], "The Digitory platform",
        "One restaurant operating system, twelve connected modules",
        "Billing, kitchen, stock, purchasing, guests and reports share one menu and one set of numbers. When an order is placed, everything it touches updates on its own.")
    body += f'''<section class="section bg-soft" id="more"><div class="wrap">
<div class="head"><span class="eyebrow">How it connects</span><h2>One order, five updates, zero re-typing</h2></div>{flow_html}</div></section>
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">Modules</span><h2>Everything a busy venue runs on</h2><p class="lede">Start with billing and add modules as you grow. They all work together from day one.</p></div>{blocks}</div></section>
{eco_section("AI on every module", "Every module comes with its own AI", "Because every module shares the same data, Digitory’s AI can watch your whole business. Here are the eight AI modules and what each skill does for you.", "bg-soft")}
<section class="section bg-navy"><div class="wrap split">
<div style="display:flex;flex-direction:column;gap:22px"><span class="eyebrow">Reliable and secure</span><h2>Built to stay up on your busiest night</h2>
<ul class="ticks"><li><span><b>Offline billing.</b> The POS keeps working without internet and syncs later.</span></li><li><span><b>Role-based access.</b> Cashiers, captains, managers and owners each see what they need.</span></li><li><span><b>Audit trail.</b> Every void, discount and price change is logged with who did it.</span></li><li><span><b>Cloud backups.</b> Your data is backed up and available from anywhere.</span></li></ul></div>
<div style="display:flex;flex-direction:column;gap:22px"><span class="eyebrow">Connects with</span><h2>The tools you already use</h2>
<div class="chips"><span class="chip">Swiggy</span><span class="chip">Zomato</span><span class="chip">Tally</span><span class="chip">UPI and card payments</span><span class="chip">WhatsApp</span><span class="chip">SMS</span><span class="chip">Thermal printers</span><span class="chip">Android tablets</span><span class="chip">Obvvy</span></div>
<p class="muted">Need another integration? Tell us what you use and we’ll check.</p></div>
</div></section>''' + cta()
    ld = [crumbs_ld([("Home", "home"), ("Platform", "platform")]),
          {"@type": "SoftwareApplication", "name": "Digitory", "applicationCategory": "BusinessApplication", "operatingSystem": "Web, Android, Windows", "publisher": {"@id": DOMAIN + "/#org"}}]
    return doc("platform", "Restaurant Management Platform | POS, Inventory, CRM | Digitory",
               "Twelve connected modules for restaurants: POS, kitchen display, QR ordering, inventory, purchasing, CRM, reservations, feedback, wallets and live reports.", body, ld)

# ======================= MODULE PAGE TEMPLATE =======================
def module_page(slug, trail_name, eyebrow, h1, lede, title, desc, sections, faqs, extra_ld=None):
    body = page_hero([("Home", "home"), ("Platform", "platform"), (trail_name, slug)], eyebrow, h1, lede)
    for i, s in enumerate(sections):
        sid, kicker, h2, text, bullets, visual = s
        bg = " bg-soft" if i % 2 == 0 else ""
        rev = " rev" if i % 2 else ""
        tick = "".join(f"<li><span>{b}</span></li>" for b in bullets)
        body += f'''<section class="section{bg}" id="{sid}"><div class="wrap split{rev}">
<div style="display:flex;flex-direction:column;gap:22px"><span class="eyebrow">{kicker}</span><h2>{h2}</h2><p class="lede">{text}</p><ul class="ticks">{tick}</ul></div>
<div>{visual}</div></div></section>'''
    from agents import ai_band
    bands = {
      "pos": (["Shift watch", "Kitchen pace", "Day close", "Aggregator sync"], "Agents that watch the floor while you serve", "They flag unusual voids, slow tickets and delivery-app problems during service, and prepare the day close for your manager."),
      "inventory": (["Reorder", "Variance and theft", "Recipe cost drift", "Vendor price watch"], "Agents that guard your food cost", "They draft tomorrow’s order, catch stock that doesn’t add up and warn you when a price rise eats into a dish’s margin."),
      "guests": (["Win-back", "Review replies", "Booking agent", "Complaint recovery"], "Agents that bring guests back", "They find regulars who drifted away, answer reviews, confirm bookings on WhatsApp and help rescue a bad night.")}
    from sim import sim_section as _sim
    sims = {"pos": ("See the POS agents at work", "A café’s lunch rush, a suspicious void, a tax mistake, the day close and a support fix, each handled by an AI agent."),
            "inventory": ("See the inventory agents at work", "A restaurant chain’s week: a price rise, a stock gap, a short delivery, a transfer and the monthly review."),
            "guests": ("See the guest agents at work", "A fine-dining evening: bookings, guest memory, a rescued complaint, review replies and a win-back campaign.")}
    if slug in sims: body += _sim("", sims[slug][0], sims[slug][1], "bg-soft", slug)
    if slug == "inventory":
        from managed import mi_band
        body += mi_band()
    if slug in bands: body += ai_band(*bands[slug])
    body += faq_html(faqs, "Common questions") + cta()
    ld = [crumbs_ld([("Home", "home"), ("Platform", "platform"), (trail_name, slug)]), faq_ld(faqs)] + (extra_ld or [])
    return doc(slug, title, desc, body, ld, active="platform")

def mini(rows, title):
    r = "".join(f'<div style="display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--line);font-size:15px"><span>{a}</span><b style="font-weight:600;text-align:right">{b}</b></div>' for a, b in rows)
    return f'<div class="card" style="box-shadow:0 30px 60px -30px rgba(34,51,69,.3)"><span class="small muted" style="font-weight:600;text-transform:uppercase;letter-spacing:.1em">{title}</span>{r}<span class="small muted">Example view</span></div>'

def pos():
    secs = [
     ("more", "Billing", "Bill a full house without slowing down", "A billing screen your staff learn in an afternoon, built for the rush: big touch targets, quick search and modifiers in one tap.",
      ["Dine-in, takeaway, delivery and counter in one screen", "Split by item, seat or amount; merge and move tables", "Happy hours, tiered prices and combos that apply themselves", "Manager approval for voids and discounts, with a full log"],
      mini([("Table 12 · 4 covers", "₹3,240"), ("Split", "2 ways"), ("Happy hour", "applied"), ("Payment", "UPI + card")], "Bill in progress")),
     ("kds", "Kitchen display", "The kitchen sees what to cook, in the order to cook it", "Orders go to the right station as they are placed: grill, tandoor, bar or dessert. Chefs mark items ready, and captains know when to pick up.",
      ["Station routing by category or item", "Prep timers that flag late tickets", "Course firing for fine dining", "Works alongside your KOT printers"],
      mini([("Grill · T6", "2 min"), ("Tandoor · T4", "6 min"), ("Bar · T12", "ready"), ("Zomato #9042", "4 min")], "Kitchen screen")),
     ("qr", "QR ordering", "Let guests order and pay from the table", "Guests scan, browse your live menu and order. The order reaches the kitchen without a captain re-typing it, and the bill closes itself when they pay.",
      ["Live menu with photos, availability and modifiers", "Orders straight to KDS or printer", "Pay at table by UPI or card", "Works for dine-in, takeaway and rooms"],
      mini([("Scans today", "214"), ("Orders placed", "168"), ("Paid at table", "61%"), ("Avg. order", "₹1,120")], "QR orders · example")),
     ("delivery", "Delivery apps", "Swiggy and Zomato in the same queue", "Stop juggling tablets. Aggregator orders arrive in Digitory, go to the kitchen like any order, and deduct stock the same way.",
      ["One queue for every channel", "Menu and item availability synced", "Channel-wise sales and commission reports", "Payout checks against your bills"],
      mini([("Swiggy", "42 orders"), ("Zomato", "37 orders"), ("Own QR", "26 orders"), ("Dine-in", "118 bills")], "Orders by channel · today")),
    ]
    faqs = [("Can Digitory run offline?", "Yes. Billing, KOTs and printing continue without internet. Data syncs automatically when the connection returns."),
            ("Which devices does the POS run on?", "Windows billing terminals, Android tablets and captain apps on Android phones, with standard thermal printers."),
            ("Can I set different prices for different areas or times?", "Yes. Set prices by area, outlet, order type and time, including happy hours and weekend pricing."),
            ("How are voids and discounts controlled?", "You decide which roles can void or discount. Approvals and reasons are logged, and reports show who did what.")]
    return module_page("pos", "POS and billing", "Restaurant POS and billing", "Restaurant POS that keeps up with your rush",
        "Fast billing, a kitchen that always knows what’s next, QR ordering and every delivery app in one queue. And it keeps working when the internet doesn’t.",
        "Restaurant POS & Billing Software | KDS, QR Ordering | Digitory",
        "Fast restaurant billing software with kitchen display, QR ordering, Swiggy and Zomato integration, split bills and offline mode. Built for busy restaurants and bars.", secs, faqs)

def inventory():
    secs = [
     ("more", "Live stock", "Stock that moves with every bill", "Every sale deducts its recipe, so your stock levels are always current. Count less often, and trust the numbers in between.",
      ["Recipe-based deduction for food and bar", "Multiple stores: kitchen, bar, cold room", "Wastage and staff meals logged with reasons", "Daily variance between expected and actual stock"],
      mini([("Paneer", "3.0 kg · low"), ("Basmati rice", "52 kg"), ("Chicken", "8.5 kg · low"), ("Cooking oil", "12 L")], "Inventory at a glance")),
     ("costing", "Recipes and costing", "Know what every plate really costs", "Build recipes once. When purchase prices change, plate costs and margins update across the menu.",
      ["Plate cost and margin for every dish", "Sub-recipes for gravies, bases and batters", "Price-change alerts on your key ingredients", "Menu engineering: stars, workhorses and slow movers"],
      mini([("Butter Chicken", "28% food cost"), ("Paneer Tikka", "31% food cost"), ("Dal Makhani", "19% food cost"), ("Margherita", "24% food cost")], "Plate costs")),
     ("purchasing", "Purchasing", "Order the right quantity from the right vendor", "Raise indents from par levels, compare vendor prices and turn them into purchase orders. Receive goods against the PO, so you pay for what arrived.",
      ["Par levels and suggested indents", "Purchase orders, goods receipt and invoices", "Vendor price history and comparisons", "Approvals by value and outlet"],
      mini([("Indent #318", "Fresh Farms"), ("Items", "14"), ("Value", "₹38,450"), ("Status", "awaiting approval")], "Purchase order")),
     ("bar", "Bar and central kitchen", "Bottles, pegs and transfers that add up", "Track spirits by the bottle and the peg, keep excise registers, and move stock between outlets and a central kitchen with a full trail.",
      ["Bottle-to-peg conversion and open-bottle tracking", "Excise-ready stock registers", "Central kitchen production and outlet transfers", "Inter-outlet transfers with receipts"],
      mini([("Whisky (750 ml)", "22 btl + 410 ml"), ("Pegs sold", "1,284"), ("Variance", "−0.6%"), ("Excise register", "updated")], "Bar stock · this week")),
    ]
    faqs = [("Do I need to count stock every day?", "No. Stock updates with every sale and receipt. Most venues count key items daily and do a full count weekly or monthly."),
            ("Can it handle bar stock in pegs and bottles?", "Yes. Spirits are tracked in bottles and pegs, with open-bottle levels and excise registers."),
            ("Does it work with a central kitchen?", "Yes. Plan production, transfer to outlets and track every movement and cost."),
            ("Can I see food cost by dish?", "Yes. Plate cost and margin are calculated from your recipes and the latest purchase prices.")]
    return module_page("inventory", "Inventory and purchasing", "Restaurant inventory and purchasing", "Inventory that matches your sales, every single day",
        "Recipe-based stock, plate costing, purchasing and bar stock in one place. See variance the next morning and fix it before it becomes a habit.",
        "Restaurant Inventory Management & Purchasing Software | Digitory",
        "Restaurant inventory software with recipe costing, live stock, purchase orders, vendor prices, bar stock in pegs and bottles, and central kitchen transfers.", secs, faqs)

def guests():
    secs = [
     ("more", "CRM", "Know who walks in, and why they come back", "Every bill builds a guest profile: visits, spend, favourite dishes and occasions. Use it to treat regulars like regulars.",
      ["Guest profiles built from bills, bookings and QR orders", "Segments like regulars, lapsed and big spenders", "Birthday and anniversary reminders", "Phone numbers masked for staff who don’t need them"],
      mini([("Visits", "14"), ("Avg. spend", "₹2,850"), ("Favourite", "Hefeweizen, Nachos"), ("Last visit", "9 days ago")], "Guest profile · example")),
     ("loyalty", "Loyalty and campaigns", "Rewards and offers that pay for themselves", "Run points, tiers or wallet credit, and send offers on WhatsApp or SMS to the right guests. Then see how many came back and what they spent.",
      ["Points, tiers and wallet credit", "Campaigns by segment, day and outlet", "WhatsApp and SMS delivery", "Campaign results measured in visits and revenue"],
      mini([("Win-back offer", "1,240 guests"), ("Returned", "186"), ("Revenue", "₹4.1L"), ("Cost", "₹38K")], "Campaign result · example")),
     ("reservations", "Reservations", "Bookings, tables and waitlists in one place", "Take bookings from your site and phone, plan the floor and quote honest waiting times. Your host knows a regular before they say their name.",
      ["Online and phone bookings", "Table plan and turn times", "Waitlist with SMS when the table is ready", "Guest notes and preferences at the door"],
      mini([("Tonight", "86 covers booked"), ("Walk-in wait", "~20 min"), ("Regulars", "12"), ("Birthdays", "3")], "Tonight’s book")),
     ("feedback", "Feedback and wallets", "Hear from guests, and make paying effortless", "Collect ratings tied to the bill, dish and server, and respond before a bad night becomes a bad review. For events and clubs, run cashless wallets with Obvvy.",
      ["Feedback linked to bill, dish and staff", "Low-score alerts to the manager", "Cashless guest wallets and top-ups", "Staff wallets and benefits"],
      mini([("Rating today", "4.6 / 5"), ("Low scores", "2 · alerted"), ("Wallet top-ups", "₹6.2L"), ("Refunds", "auto")], "Guests · today")),
    ]
    faqs = [("Can I send offers on WhatsApp?", "Yes. Campaigns can go out on WhatsApp or SMS to the segments you choose."),
            ("Where does guest data come from?", "From bills, reservations, QR orders and feedback. Each guest is matched by phone number."),
            ("Is guest data kept private?", "Access is role-based and phone numbers can be masked for staff. Guests can opt out of messages."),
            ("Do you support cashless wallets for events?", "Yes, through Obvvy: guest wallets, top-ups, ticketing, entry and refunds.")]
    return module_page("guests", "CRM, loyalty and reservations", "Restaurant CRM, loyalty and reservations", "Turn first visits into regulars",
        "Guest profiles from every bill, loyalty that works on WhatsApp, reservations that remember people, and feedback you can act on the same night.",
        "Restaurant CRM, Loyalty & Reservation Software | Digitory",
        "Restaurant CRM and loyalty software with guest profiles, WhatsApp campaigns, reservations, waitlists, feedback and cashless wallets for events.", secs, faqs)

PAGES = {"home": home, "platform": platform, "pos": pos, "inventory": inventory, "guests": guests}
