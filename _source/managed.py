from core import *
from sim import sim_section

MI_FAQ = [
 ("What is Managed Inventory?", "A service where a Digitory inventory manager runs your stock control for you, using Digitory’s inventory module and AI agents. We set up recipes, reconcile counts, check deliveries and review food cost with you every month."),
 ("Do I still need a store manager?", "Your team still receives goods and does the physical counts. We plan the counts, reconcile them, chase the gaps and tell you what to fix. Most venues no longer need a separate cost controller."),
 ("Is it remote or on-site?", "Remote by default, through Digitory and WhatsApp, with scheduled on-site visits for counts and audits where you need them. [Confirm on-site cities and visit frequency.]"),
 ("Can I start with software only and add the service later?", "Yes. Many customers start with the inventory module and AI agents, then add Managed Inventory when they open more outlets."),
 ("How do I know it’s working?", "You get a monthly food cost report with variance by item and outlet, the actions taken, and a review call with your inventory manager."),
]

def mi_band(compact=False):
    """Home and inventory-page band: platform plus people."""
    pts = [("Recipes set up for you", "We build every recipe and sub-recipe from your menu, using Digitory’s ingredient database."),
           ("Counts reconciled", "We plan your counts, reconcile them against sales and chase every gap."),
           ("Deliveries and prices checked", "Short supply, wrong items and vendor price creep are caught and claimed."),
           ("A monthly food cost review", "A clear report and a call with your inventory manager, with the actions to take.")]
    cards = "".join(f'<div class="mi-pt"><span class="mi-dot">{ic("check")}</span><div><b>{t}</b><p class="muted">{d}</p></div></div>' for t, d in pts)
    return f'''<section class="section mi-sec"><div class="wrap split">
<div style="display:flex;flex-direction:column;gap:20px"><span class="eyebrow">Platform plus people</span>
<h2>Managed Inventory: our experts run your stock with you</h2>
<p class="lede">Software alone doesn’t fix food cost. With Managed Inventory, a Digitory inventory manager uses our AI agents to set up, check and improve your stock control, every week.</p>
<div class="actions"><a class="btn btn-primary" href="{L("managed")}">How Managed Inventory works {ARROW}</a></div></div>
<div class="mi-card"><div class="mi-head"><span class="av">{ic("users")}</span><div><b>Your Digitory inventory manager</b><span>Working with your store team, backed by AI agents</span></div></div>{cards}</div>
</div></section>'''

def managed_page():
    steps = [("Week 1", "Set up", "We import your menu, build recipes and sub-recipes, set par levels and connect your vendors."),
             ("Weeks 2–4", "Stabilise", "First full count, opening stock fixed, and the reorder and variance agents tuned to your venue."),
             ("Every day", "Watch", "AI agents watch consumption, prices and deliveries. Your inventory manager follows up on anything unusual."),
             ("Every week", "Count and reconcile", "We plan the count, reconcile it against sales and share the variance with your team."),
             ("Every month", "Review", "A food cost report by item and outlet, and a review call with the actions for next month.")]
    st = '<ol class="flow" style="padding:0;margin:0">' + "".join(f"<li><b>{b}</b><span class='small' style='color:var(--orange);font-weight:600'>{a}</span><br><span>{c}</span></li>" for a, b, c in steps) + "</ol>"
    split = [("AI agents do", ["Deduct recipes from stock with every sale", "Draft purchase orders from par levels and forecast", "Flag variance, price rises and short deliveries", "Recalculate plate costs when prices change"]),
             ("Your inventory manager does", ["Builds and corrects recipes with your chef", "Plans and reconciles counts with your store team", "Chases vendors on claims and price creep", "Reviews food cost with you and agrees actions"]),
             ("Your team does", ["Receives goods against purchase orders", "Does the physical counts on the planned days", "Approves orders and changes with one tap", "Acts on the monthly review"])]
    cols = "".join(f'<div class="card"><h3>{t}</h3><ul class="ticks">{"".join(f"<li><span>{x}</span></li>" for x in xs)}</ul></div>' for t, xs in split)
    who = [("Single outlets without a cost controller", "Get professional stock control without hiring for it."),
           ("Growing groups", "Keep food cost consistent as you open new outlets."),
           ("Chains with a central kitchen", "Central purchasing, transfers and outlet-level variance, managed end to end."),
           ("Bars and breweries", "Peg-level variance, bottle counts and excise registers kept in order.")]
    who_html = "".join(f'<div class="card"><h3>{t}</h3><p class="muted">{d}</p></div>' for t, d in who)
    body = f'''<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="{L("home")}">Home</a> / <a href="{L("platform")}">Platform</a> / <span aria-current="page">Managed Inventory</span></nav>
<span class="eyebrow">Managed service</span><h1>Managed Inventory</h1>
<p class="lede">Our inventory experts run your stock control with you, using Digitory and its AI agents. Recipes built, counts reconciled, deliveries checked and food cost reviewed every month, without hiring a cost controller.</p>
<div class="actions"><a class="btn btn-primary" href="{L("demo")}">Talk to an inventory expert {ARROW}</a><a class="btn btn-ghost" href="#how">How it works</a></div>
<div class="hero-proof"><span>Dedicated inventory manager</span><span>Monthly food cost review</span><span>Backed by AI agents</span></div></div>
<div class="mi-card"><div class="mi-head"><span class="av">{ic("users")}</span><div><b>Monthly review · Koramangala</b><span>Example report</span></div></div>
<div class="sim-row in"><span>Food cost</span><span>30.4% · target 31%</span></div>
<div class="sim-row in good"><span>Stock variance</span><span>1.9% · target 2%</span></div>
<div class="sim-row in bad"><span>Biggest gap</span><span>Chicken · 6.2 kg</span></div>
<div class="sim-row in"><span>Vendor claims raised</span><span>4 · ₹3,820</span></div>
<div class="sim-row in"><span>Recipes corrected</span><span>12</span></div>
<p class="small muted" style="margin-top:10px">Next month: portion check on wings at the bar; switch onions to the second vendor.</p></div>
</div></section>
{sim_section("", "Watch Managed Inventory at work", "Our inventory manager and the AI agents, working together on a restaurant chain’s stock.", "", "managed")}
<section class="section bg-soft" id="how"><div class="wrap"><div class="head"><span class="eyebrow">How it works</span><h2>From set-up to a steady monthly rhythm</h2></div>{st}</div></section>
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">Who does what</span><h2>AI, experts and your team, each doing what they do best</h2></div><div class="grid g3">{cols}</div></div></section>
<section class="section bg-soft"><div class="wrap"><div class="head"><span class="eyebrow">Who it’s for</span><h2>Built for venues that want food cost under control</h2></div><div class="grid g4">{who_html}</div></div></section>''' + faq_html(MI_FAQ, "About Managed Inventory") + cta("Let’s look at your food cost together", "Book a call with an inventory expert. We’ll review how you control stock today and show you what Managed Inventory would change.")
    ld = [crumbs_ld([("Home", "home"), ("Platform", "platform"), ("Managed Inventory", "managed")]), faq_ld([(q, a) for q, a in MI_FAQ if "[" not in a]),
          {"@type": "Service", "name": "Digitory Managed Inventory", "serviceType": "Restaurant inventory management service", "provider": {"@id": DOMAIN + "/#org"}, "areaServed": "IN"}]
    return doc("managed", "Managed Inventory Service for Restaurants | Digitory",
               "Digitory’s inventory experts run your restaurant stock control: recipe setup, count reconciliation, delivery and price checks, and a monthly food cost review.", body, ld, active="platform")

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
