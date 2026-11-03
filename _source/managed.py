from core import *
from sim import sim_section

MI_FAQ = [
 ("What is Managed Inventory?", "A service where Digitory runs your inventory and recipes in the system. Your team does the physical work on site: receiving, issuing, logging waste and counting. Our team sets up the masters and recipes, checks every entry each morning, closes the month and sends you an owners report."),
 ("What does my team have to do?", "One inventory person, full time on site, receives goods, issues stock to the bar and kitchen, logs waste, comps and staff meals, and does the weekly and month-end counts, using simple checklists in the Digitory app. No inventory experience is needed; we train them."),
 ("What do the owner, chef and bar manager do?", "The chef and bar manager share recipe cards once, about 2 hours a week in the first month. The owner approves order lists, decides only on what we flag, and joins a 30-minute review call each month."),
 ("Is the Digitory team on site?", "We work remotely, through Digitory and WhatsApp, with visits when needed. All physical work, such as indents, issues and stock counts, is done by your team at the restaurant."),
 ("How soon will I see results?", "Within 30 days your top-selling items have costed recipes, your opening stock is counted and the daily routine is running. Your first monthly owners report arrives on Day 5 of the next month."),
]

def mi_band(compact=False):
    """Home and inventory-page band: platform plus people."""
    pts = [("Your team does the physical work", "Receiving, issuing, waste and counts, with simple checklists in the Digitory app."),
           ("We set up masters and recipes", "Items, vendors, units and costed recipes, linked to your POS."),
           ("We check every entry, every morning", "Receipts, prices, stock and waste. Only what needs a decision reaches you."),
           ("We close the month for you", "A monthly owners report on Day 5 and a review call with 3 actions.")]
    cards = "".join(f'<div class="mi-pt"><span class="mi-dot">{ic("check")}</span><div><b>{t}</b><p class="muted">{d}</p></div></div>' for t, d in pts)
    return f'''<section class="section mi-sec"><div class="wrap split">
<div style="display:flex;flex-direction:column;gap:20px"><span class="eyebrow">Platform plus people</span>
<h2>You run the floor. Digitory runs your inventory and recipes.</h2>
<p class="lede">With Managed Inventory, your team does the physical work at the restaurant and our team sets up, checks and closes everything in the system, backed by our AI agents.</p>
<div class="actions"><a class="btn btn-primary" href="{L("managed")}">How Managed Inventory works {ARROW}</a></div></div>
<div class="mi-card"><div class="mi-head"><span class="av">{ic("users")}</span><div><b>Managed Inventory and Recipes</b><span>Your team on site, the Digitory team behind it</span></div></div>{cards}</div>
</div></section>'''

def _rows(items):
    return "".join(f'<li><span>{t}</span></li>' for t in items)

def managed_page():
    roles = [("Your inventory person", "On site, full time", "#E5531A",
              ["Receives goods and enters the GRN with a photo", "Issues stock to the bar and kitchen", "Logs waste, comps and staff meals", "Counts high-value items every week", "Does the full count on the last night of the month"],
              "Simple checklists in the Digitory app. No experience needed; we train them."),
             ("Owner, chef and bar manager", "Approve and guide", "#2563EB",
              ["Share recipe cards once (chef and bar)", "Approve the weekly order list", "Decide only on what we flag", "Join a 30-minute review call each month"],
              "About 2 hours a week from the chef and bar in month 1, then much less."),
             ("Digitory team", "Remote, with visits", "#15803D",
              ["Sets up item, vendor and unit masters", "Builds, costs and links recipes to the POS", "Checks every entry each morning and fixes errors", "Sends the weekly variance note and order list", "Closes the month and sends the owners report"],
              "Backed by Digitory’s AI agents for alerts, variance and costing.")]
    role_html = "".join(f'<div class="card mi-role" style="--c:{c}"><span class="mi-tag">{tag}</span><h3>{t}</h3><ul class="ticks">{_rows(xs)}</ul><p class="small muted">{note}</p></div>' for t, tag, c, xs, note in roles)

    def lane(title, steps):
        return f'<div class="mi-lane"><h3>{title}</h3><ol>' + "".join(f'<li><b>{a}</b><span>{b}</span><em class="{w}">{wl}</em></li>' for a, b, w, wl in steps) + '</ol></div>'
    T, O, D = ("t", "Your team"), ("o", "Owner"), ("d", "Digitory")
    day = [("Morning", "Receive goods, enter GRN and photo", *T), ("Through the day", "Issue stock to bar and kitchen", *T), ("Night close", "Log waste, comps and staff meals", *T), ("Next morning", "Check every entry: prices, negatives", *D), ("By 1 PM", "Fix errors and alert the owner, only if needed", *D)]
    week = [("Monday", "Count spirits, kegs, meat and seafood", *T), ("Tuesday", "Variance note and order list", *D), ("Owner", "Approves the order", *O), ("Rest of week", "Recipe updates as the menu changes", *D)]
    month = [("Last night", "Full count: store, bar and kitchen", *T), ("Day 3", "Digitory closes the month", *D), ("Day 5", "Owners report approved and sent", *D), ("Day 7", "Review call: 3 actions", *O)]
    rhythm = lane("Every day", day) + lane("Every week", week) + lane("Every month", month)

    checks = [("receipt", "Receipts", "Every delivery entered and matched to the invoice and order."), ("rupee", "Prices", "Any price up more than 5% from the last purchase."),
              ("box", "Stock", "Negative or unusual stock, and issues without a request."), ("alert", "Waste", "Waste, comps and staff meals logged and reasonable."),
              ("book", "Recipes", "New menu items without a recipe."), ("bell", "Alerts", "Only what needs a decision goes to the owner.")]
    I.setdefault("alert", '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.01"/>'); I.setdefault("book", '<path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z"/>')
    check_html = "".join(f'<div class="card">{icon_box(i)}<h3>{t}</h3><p class="muted">{d}</p></div>' for i, t, d in checks)

    recipe = [("Recipe card", "Chef and bar manager", "Ingredients per portion"), ("Build and cost", "Digitory", "Yields and latest prices"), ("Link to POS", "Digitory", "Each sale draws stock"), ("Compare", "Monthly", "Actual against recipe")]
    rec_html = '<ol class="flow" style="padding:0;margin:0">' + "".join(f"<li><b>{a}</b><span class='small' style='color:var(--orange);font-weight:600'>{b}</span><br><span>{c}</span></li>" for a, b, c in recipe) + "</ol>"

    weeks = [("Week 1", "Item, vendor and unit masters · train your inventory person · work areas and par levels"),
             ("Week 2", "Recipes for top items (80% of sales) · opening count in all areas"),
             ("Week 3", "Daily routine live · daily Digitory checks begin · recipes for the full menu"),
             ("Week 4", "Full menu costed · first month close and owners report")]
    wk_html = '<ol class="waves">' + "".join(f'<li><b class="accent">{w}</b><p>{t}</p></li>' for w, t in weeks) + '</ol>'

    gets = [("100%", "menu linked to recipes by day 30"), ("Exact", "food and drink cost, every month"), ("Within 1%", "store stock against the books"), ("Day 5", "owners report with 3 actions")]
    needs = [("1 person", "full time, on site"), ("2 hrs/week", "chef and bar, in month 1"), ("Approvals", "orders, vendors and prices"), ("3 hrs", "month-end count night")]
    kp = lambda xs: "".join(f'<div class="mi-k"><b>{a}</b><span>{b}</span></div>' for a, b in xs)

    weekly = ["Variance on spirits, kegs, meat and seafood, in value", "Order list against par levels, for your approval", "Price increases over 5%, by vendor", "Waste, comps and staff meals, in value", "Open issues: missing entries, negative stock", "Menu items still without a recipe"]
    monthly = ["Food and drink cost %, actual against recipe", "Full count variance by store, bar and kitchen", "Opening, purchases, consumption and closing stock", "Purchases by vendor, with price trends", "Top 10 variance items, with reasons", "Menu items below target margin", "3 actions for next month, agreed on the call"]

    body = f'''<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="{L("home")}">Home</a> / <a href="{L("platform")}">Platform</a> / <span aria-current="page">Managed Inventory</span></nav>
<span class="eyebrow">Managed Inventory and Recipes</span><h1>You run the floor. Digitory runs your inventory and recipes.</h1>
<p class="lede">Your team does the physical work at the restaurant: receiving, issuing, logging waste and counting. Our team sets up, checks and closes everything in the system, so you get exact food and drink cost every month.</p>
<div class="actions"><a class="btn btn-primary" href="{L("demo")}">Talk to an inventory expert {ARROW}</a><a class="btn btn-ghost" href="#who">Who does what</a></div>
<div class="hero-proof"><span>Recipes linked in 30 days</span><span>Daily checks by Digitory</span><span>Owners report every month</span></div></div>
<div class="mi-card"><div class="mi-head"><span class="av">{ic("users")}</span><div><b>Monthly owners report · Day 5</b><span>Example</span></div></div>
<div class="sim-row in"><span>Food and drink cost</span><span>30.4% · recipe 29.6%</span></div>
<div class="sim-row in good"><span>Store stock against books</span><span>within 0.8%</span></div>
<div class="sim-row in bad"><span>Top variance item</span><span>Chicken · ₹6,200</span></div>
<div class="sim-row in warn"><span>Items below target margin</span><span>4 dishes</span></div>
<div class="sim-row in"><span>Price increases over 5%</span><span>3 vendors</span></div>
<p class="small muted" style="margin-top:10px"><b style="color:var(--ink)">3 actions:</b> portion check on wings · switch onion vendor · re-price Paneer Tikka</p></div>
</div></section>
<section class="section bg-soft" id="who"><div class="wrap"><div class="head"><span class="eyebrow">Who does what</span><h2>Physical work at the restaurant. Everything else, Digitory.</h2><p class="lede">Indents, issues and stock counts are done by your team on site. Digitory manages the system side: setup, checks, fixes and the month close.</p></div><div class="grid g3">{role_html}</div></div></section>
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">The routine</span><h2>Every day, every week, every month</h2>
<div class="chips"><span class="chip"><i class="mi-sw t"></i>Your team</span><span class="chip"><i class="mi-sw o"></i>Owner</span><span class="chip"><i class="mi-sw d"></i>Digitory</span></div></div>
<div class="mi-lanes">{rhythm}</div></div></section>
<section class="section bg-soft"><div class="wrap"><div class="head"><span class="eyebrow">Every morning</span><h2>What Digitory checks before lunch</h2></div><div class="grid g3">{check_html}</div></div></section>
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">Recipe management</span><h2>Every dish costed, every sale counted</h2></div>{rec_html}
<p class="note mt-24"><b>One rule:</b> no item goes on the POS menu without a recipe, and every price change is costed first.</p></div></section>
{sim_section("", "Watch Managed Inventory at work", "Your team’s entries, Digitory’s checks and the AI agents, working together on a restaurant chain’s stock.", "bg-soft", "managed")}
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">The first 30 days</span><h2>From set-up to your first owners report</h2></div>{wk_html}</div></section>
<section class="section bg-soft"><div class="wrap split" style="align-items:start">
<div><span class="eyebrow">What you get</span><div class="mi-kpis mt-16">{kp(gets)}</div></div>
<div><span class="eyebrow">What we need from you</span><div class="mi-kpis mt-16">{kp(needs)}</div></div></div></section>
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">Reports you receive</span><h2>Clear numbers, every week and every month</h2></div>
<div class="grid g2"><div class="card"><h3>Weekly report</h3><p class="small muted">Every Tuesday, with the order list</p><ul class="ticks">{_rows(weekly)}</ul></div>
<div class="card"><h3>Monthly owners report</h3><p class="small muted">Day 5, approved and sent; reviewed on the Day 7 call</p><ul class="ticks">{_rows(monthly)}</ul></div></div></div></section>''' + faq_html(MI_FAQ, "About Managed Inventory") + cta("Let’s look at your food cost together", "Book a call with an inventory expert. We’ll look at how you control stock today and show you what Managed Inventory would change.")
    ld = [crumbs_ld([("Home", "home"), ("Platform", "platform"), ("Managed Inventory", "managed")]), faq_ld(MI_FAQ),
          {"@type": "Service", "name": "Digitory Managed Inventory and Recipe Service", "serviceType": "Restaurant inventory and recipe management service", "provider": {"@id": DOMAIN + "/#org"}, "areaServed": "IN"}]
    return doc("managed", "Managed Inventory and Recipe Service for Restaurants | Digitory",
               "You run the floor, Digitory runs your inventory and recipes. Your team receives, issues and counts; Digitory sets up recipes, checks every entry daily, closes the month and sends an owners report.", body, ld, active="platform")

MI_CSS = """
/* Managed inventory */
.mi-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;box-shadow:0 40px 80px -36px rgba(34,51,69,.35);display:flex;flex-direction:column;gap:6px}
.mi-head{display:flex;gap:12px;align-items:center;padding-bottom:12px;margin-bottom:4px;border-bottom:1px solid var(--line)}
.mi-head .av{width:42px;height:42px;border-radius:12px;background:var(--navy);color:#fff;display:grid;place-items:center;flex:none}
.mi-head .av svg{width:22px;height:22px}
.mi-head b{display:block}.mi-head span{font-size:13px;color:var(--muted)}
.mi-card .sim-row{font-size:15px}
.mi-pt{display:grid;grid-template-columns:28px minmax(0,1fr);gap:12px;padding:12px 0;border-top:1px solid var(--line)}
.mi-pt:first-of-type{border-top:0}
.mi-pt b{font-weight:600}.mi-pt p{font-size:14.5px;margin-top:2px}
.mi-dot{width:26px;height:26px;border-radius:8px;background:#E9F7F0;color:var(--ok);display:grid;place-items:center}
.mi-dot svg{width:15px;height:15px}
.mi-sec{background:linear-gradient(180deg,#fff,var(--bg-2))}
"""

MI2_CSS = """
/* Managed inventory v2 */
.mi-role{border-top:4px solid var(--c)}
.mi-tag{align-self:flex-start;font-size:12px;font-weight:700;letter-spacing:.04em;color:var(--c);background:color-mix(in srgb,var(--c) 10%,#fff);border-radius:999px;padding:3px 10px}
.mi-sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.mi-sw.t,.mi-lane em.t{background:#E5531A}.mi-sw.o,.mi-lane em.o{background:#2563EB}.mi-sw.d,.mi-lane em.d{background:#15803D}
.mi-lanes{display:grid;gap:20px}
.mi-lane{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px}
.mi-lane h3{margin-bottom:14px}
.mi-lane ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px;counter-reset:s}
.mi-lane li{position:relative;background:var(--bg-2);border-radius:12px;padding:14px 14px 34px;display:flex;flex-direction:column;gap:4px}
.mi-lane li b{font-size:13px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.mi-lane li span{font-size:15px;font-weight:500;line-height:1.4}
.mi-lane em{position:absolute;left:14px;bottom:10px;font-style:normal;font-size:11.5px;font-weight:700;color:#fff;border-radius:999px;padding:2px 9px}
.mi-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.mi-k{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px}
.mi-k b{display:block;font-size:clamp(24px,2.6vw,32px);font-weight:700;letter-spacing:-.02em;color:var(--orange)}
.mi-k span{font-size:14px;color:var(--muted)}
.waves li p{margin:0;color:var(--muted);font-size:15px}
"""
