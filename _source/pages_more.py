from core import *
from sim import sim_section, SLUG_TO_VENUE
from pages_main import mini

# ======================= DIGITALK =======================
def digitalk():
    asks = ["What were my top 5 dishes at Koramangala last week?", "Why is food cost up this month?", "Which outlet had the most voids yesterday?",
            "How many regulars haven’t visited in 30 days?", "What should I prep more of for Saturday?", "Compare this Friday with last Friday."]
    ask_html = '<div class="chips">' + "".join(f'<span class="chip">“{a}”</span>' for a in asks) + "</div>"
    jobs = [("bell", "Morning summary", "Yesterday’s sales, what went wrong and the three things worth doing today, on WhatsApp before you open."),
            ("chart", "Answers on demand", "Ask about sales, stock, staff or guests in plain words. Answers come from your own Digitory data."),
            ("shield", "Early warnings", "Stock about to run out, a vendor price jump, unusual voids or a sudden drop in an outlet’s sales."),
            ("check", "Suggestions you approve", "DigiTalk can draft an indent, an offer or a price change. Nothing is applied until you say yes.")]
    jobs_html = "".join(f'<div class="card">{icon_box(i)}<h3>{t}</h3><p class="muted">{d}</p></div>' for i, t, d in jobs)
    faqs = [("Is DigiTalk a separate product?", "No. DigiTalk is part of Digitory and works on the data already in your account."),
            ("Can DigiTalk change my menu or prices on its own?", "No. It can prepare a change, but a person with the right access has to approve it, and every change can be undone."),
            ("Who can see what?", "DigiTalk follows the same roles as Digitory. A manager sees their outlet; an owner sees all outlets. Guest phone numbers stay masked."),
            ("Which languages does it understand?", "English today. [Confirm additional languages before launch.]")]
    body = page_hero([("Home", "home"), ("DigiTalk AI", "digitalk")], "DigiTalk AI",
        "Your restaurant, answering back",
        "DigiTalk is the assistant inside Digitory. It reads your sales, stock and guest data, tells you what needs attention, and prepares the next step for you to approve.")
    body += f'''<section class="section bg-soft" id="more"><div class="wrap">
<div class="head"><span class="eyebrow">What it does</span><h2>Four jobs, done every day</h2></div><div class="grid g4">{jobs_html}</div></div></section>
<section class="section"><div class="wrap split">
<div style="display:flex;flex-direction:column;gap:22px"><span class="eyebrow">Just ask</span><h2>Questions owners actually ask</h2><p class="lede">No reports to build and no filters to set. Type the question the way you’d ask your manager.</p>{ask_html}</div>
<div class="chat" role="img" aria-label="Example: the owner asks why food cost rose and DigiTalk explains the paneer price increase">
  <div class="chat-top"><span class="av">{ic("spark")}</span><div><b>DigiTalk</b><span>Indiranagar</span></div></div>
  <div class="chat-body"><div class="msg me">Why is food cost up this month?</div>
  <div class="msg ai">Food cost is <span class="down">31.4%</span>, up from 28.9%. Most of it is paneer: your vendor raised the price 14% on the 8th, and paneer dishes are 22% of sales. Want me to compare vendors?</div>
  <div class="msg me">Yes.</div><div class="msg ai">Fresh Farms is ₹38/kg cheaper on the last 3 deliveries. I’ve drafted next week’s order with them for your approval.</div></div>
</div></div></section>
<section class="section bg-navy"><div class="wrap">
<div class="head"><span class="eyebrow">You stay in charge</span><h2>AI that asks before it acts</h2></div>
<div class="grid g3">
<div class="card"><h3>Preview, approve, undo</h3><p>Every suggested change shows the old and new value. Approve it, edit it or ignore it. Applied changes can be reversed in one tap.</p></div>
<div class="card"><h3>Same roles as your team</h3><p>DigiTalk sees only what the person asking is allowed to see, outlet by outlet.</p></div>
<div class="card"><h3>A record of everything</h3><p>What it suggested, what you accepted and what changed, kept in your account.</p></div>
</div></div></section>''' + faq_html(faqs, "About DigiTalk") + cta("See DigiTalk on a real menu", "We’ll show you DigiTalk working on a sample restaurant like yours, and how it would fit your day.")
    ld = [crumbs_ld([("Home", "home"), ("DigiTalk AI", "digitalk")]), faq_ld([(q, a) for q, a in faqs if "[" not in a])]
    return doc("digitalk", "DigiTalk | AI Assistant for Restaurants, Built into Digitory",
               "Ask your restaurant questions in plain words. DigiTalk reads your Digitory sales, stock and guest data, sends a morning summary and prepares actions you approve.", body, ld)

# ======================= SOLUTIONS =======================
SOL = {
 "s-bars": dict(title="Brewery & Bar POS Software | Pegs, Excise, Happy Hours | Digitory",
   desc="POS and inventory for breweries, pubs and bars: peg and bottle tracking, excise registers, happy-hour pricing, multi-bar billing and cashless wallets.",
   eyebrow="For breweries, pubs and bars", h1="Built for the bar that’s three deep on a Saturday",
   lede="Fast billing at every counter, stock tracked to the peg, excise registers that fill themselves, and happy hours that switch on and off on time.",
   pains=[("Bottles go missing and nobody knows when.", "Peg-level tracking and open-bottle counts show variance by bar and by shift."),
          ("Excise registers eat a manager’s week.", "Registers update from sales and receipts, ready when the inspector asks."),
          ("The bar queue slows everything down.", "Quick-key bar billing, tabs that follow the guest, and multiple counters on one bill.")],
   feats=["Peg and bottle stock with open-bottle tracking", "Excise-ready stock registers", "Happy hours and time-based pricing", "Running tabs across bars and the floor", "Brewery tap lists and keg tracking [confirm]", "Cashless wallets for events and gigs"],
   mods=[("pos", "POS and billing"), ("inventory", "Bar inventory"), ("guests", "Wallets and loyalty")]),
 "s-cafes": dict(title="Café & QSR POS Software | Fast Billing, QR, Loyalty | Digitory",
   desc="Café and quick-service POS with fast counter billing, combos and modifiers, QR ordering, Swiggy and Zomato in one queue, and loyalty for regulars.",
   eyebrow="For cafés and QSR", h1="Faster counters, happier regulars",
   lede="A billing screen built for speed, QR ordering for the queue, every delivery app in one place and a loyalty programme that runs itself.",
   pains=[("The morning queue is out the door.", "One-tap combos and modifiers, plus QR ordering so guests can order while they wait."),
          ("Three tablets beep for delivery orders.", "Swiggy, Zomato and your own orders arrive in one queue and go straight to the kitchen."),
          ("Regulars don’t feel like regulars.", "Points, birthday offers and win-back messages on WhatsApp, measured in return visits.")],
   feats=["Counter billing with combos and modifiers", "QR ordering and pay at table", "Aggregator orders in one queue", "Kitchen display for the make line", "Loyalty points and WhatsApp offers", "Stock that updates with every cup"],
   mods=[("pos", "POS and QR ordering"), ("guests", "Loyalty"), ("inventory", "Inventory")]),
 "s-fine": dict(title="Fine Dining Restaurant Software | Reservations, KDS, CRM | Digitory",
   desc="Restaurant software for fine dining: reservations and table plans, guest preferences, course firing on the kitchen display, wine stock and feedback.",
   eyebrow="For fine dining", h1="Service that feels personal, from the door to the bill",
   lede="Know your guests before they sit down, fire courses at the right moment, and close the night with numbers you can trust.",
   pains=[("The host doesn’t know it’s a regular’s anniversary.", "Guest notes, preferences and occasions appear with the booking."),
          ("Mains arrive before the starters are cleared.", "Course firing on the kitchen display, controlled by the captain."),
          ("A bad night shows up as a review three days later.", "Feedback tied to the table and server, with alerts to the manager that night.")],
   feats=["Reservations, table plan and waitlist", "Guest profiles with preferences", "Course firing on KDS", "Captain app for table-side orders", "Wine and bar stock by bottle and glass", "Feedback by dish and server"],
   mods=[("guests", "Reservations and CRM"), ("pos", "POS and KDS"), ("inventory", "Wine and bar stock")]),
 "s-cloud": dict(title="Cloud Kitchen Software | Swiggy & Zomato, Multi-brand | Digitory",
   desc="Cloud kitchen software for multi-brand kitchens: Swiggy and Zomato orders in one queue, brand-wise menus, recipe costing and payout reconciliation.",
   eyebrow="For cloud kitchens", h1="Many brands, one kitchen, one screen",
   lede="Every aggregator order in one queue, brand-wise menus and reports, and food cost you can trust when margins are thin.",
   pains=[("Orders come in on five tablets.", "All brands and all aggregators land in one queue and on the kitchen display."),
          ("Margins look fine until the payout arrives.", "Channel-wise sales, commissions and payout checks against every bill."),
          ("Food cost drifts and nobody notices.", "Recipe costing and daily variance, brand by brand.")],
   feats=["Multi-brand menus from one kitchen", "Swiggy and Zomato in one queue", "Item availability synced to apps", "Recipe costing per brand", "Payout and commission reports", "Prep forecasts from past orders [confirm]"],
   mods=[("pos", "Delivery orders and KDS"), ("inventory", "Costing and stock"), ("digitalk", "Reports")]),
 "s-chains": dict(title="Multi-outlet Restaurant Software for Chains | Digitory",
   desc="Restaurant software for chains and central kitchens: central menu and price control, outlet comparisons, central purchasing, transfers and Tally export.",
   eyebrow="For chains and central kitchens", h1="Run fifty outlets like you run one",
   lede="Control menus and prices from head office, buy centrally, move stock from your central kitchen and compare every outlet on one screen.",
   pains=[("Every outlet runs its own version of the menu.", "Menus, prices and taxes are managed centrally and pushed to outlets."),
          ("Purchasing is different in every kitchen.", "Central indents, approved vendors and price lists, with outlet-level receiving."),
          ("Month-end takes two weeks.", "Outlet P&L inputs, GST-ready reports and Tally export, without the spreadsheets.")],
   feats=["Central menu, price and tax control", "Outlet comparisons and league tables", "Central kitchen production and transfers", "Approved vendors and price lists", "Roles and permissions by outlet", "Tally export and GST reports"],
   mods=[("inventory", "Central kitchen and purchasing"), ("pos", "POS"), ("digitalk", "Multi-outlet reports")]),
 "s-events": dict(title="Club & Event POS | Cashless Wallets, Ticketing, Entry | Digitory",
   desc="POS for clubs and events with Obvvy cashless wallets, ticketing and entry, multiple bars on one system, live sales and automatic refunds.",
   eyebrow="For clubs and events", h1="Fast bars, no cash, no chaos",
   lede="Cashless wallets, ticketing and entry with Obvvy, multiple bars on one system, and live numbers while the night is still on.",
   pains=[("Cash slows every bar and every refund.", "Guests top up a wallet once and tap to pay at any bar. Unused balance is refunded automatically."),
          ("Nobody knows how the night is going until it’s over.", "Live sales by bar, live crowd counts and stock levels on your phone."),
          ("Entry and the bar run on different systems.", "Tickets, entry, wallets and bars share one guest record.")],
   feats=["Cashless wallets and top-ups (Obvvy)", "Ticketing and entry scanning", "Multiple bars on one system", "Live sales and stock by bar", "Automatic refunds of unused balance", "Post-event reports"],
   mods=[("guests", "Wallets and events"), ("pos", "Bar POS"), ("inventory", "Bar stock")]),
}

SOL_AI = {"s-bars": ["Shift watch", "Variance and theft", "Event live"], "s-cafes": ["Win-back", "Reorder", "Aggregator sync"],
 "s-fine": ["Guest memory", "Booking agent", "Review replies"], "s-cloud": ["Commission check", "Recipe cost drift", "Prep forecast"],
 "s-chains": ["Outlet indent", "Production plan", "Payment matching"], "s-events": ["Event live", "Refunds and matching", "Event report"]}
def sol_ai(slug):
    from agents import GROUPS, agent_rows
    allag = {a[0]: a for _, _, _, ags in GROUPS for a in ags}
    rows = agent_rows([allag[n] for n in SOL_AI[slug]])
    return f'''<section class="section tight ai-band"><div class="wrap"><div class="ai-strip">
<div class="ai-strip-copy"><span class="eyebrow">AI built in</span><h2 style="font-size:clamp(26px,3vw,36px)">Three AI agents venues like yours rely on</h2><p class="muted">Each agent looks after one job, prepares the work and waits for your OK.</p><a class="link" href="{L("ai")}">Meet all the AI agents {ARROW}</a></div>
<div class="card agent-card"><ul class="agents">{rows}</ul></div></div></div></section>'''

def solution(slug):
    d = SOL[slug]
    name = next(t for s, _, t, _ in SOLUTIONS if s == slug)
    pains = "".join(f'<div class="pa-row"><p class="pa-q">{q}</p><div class="pa-a"><span class="tag">With Digitory</span><p class="muted" style="font-size:18px">{a}</p></div></div>' for q, a in d["pains"])
    feats = "".join(f"<li><span>{f}</span></li>" for f in d["feats"])
    mods = "".join(f'<a class="card" href="{L(s)}"><h3>{t}</h3><span class="link">Learn more {ARROW}</span></a>' for s, t in d["mods"])
    others = "".join(f'<a class="chip" style="text-decoration:none" href="{L(s)}">{t}</a>' for s, _, t, _ in SOLUTIONS if s != slug)
    body = page_hero([("Home", "home"), ("Solutions", "solutions"), (name, slug)], d["eyebrow"], d["h1"], d["lede"])
    body += f'''<section class="section bg-soft" id="more"><div class="wrap"><div class="head"><span class="eyebrow">The everyday problems</span><h2>What gets in the way, and how we fix it</h2></div><div class="pa">{pains}</div></div></section>
{sim_section(SLUG_TO_VENUE[slug], "Watch the agents that matter most for you", "Short scenes picked for venues like yours. Press play and tap approve when an agent asks.", "")}
<section class="section"><div class="wrap split">
<div style="display:flex;flex-direction:column;gap:22px"><span class="eyebrow">What you get</span><h2>Set up for how you work</h2><ul class="ticks">{feats}</ul></div>
<div style="display:flex;flex-direction:column;gap:16px"><span class="eyebrow">Modules you’ll use most</span><div class="grid">{mods}</div></div>
</div></section>
{sol_ai(slug)}
<section class="section tight"><div class="wrap"><figure class="quote" style="max-width:860px;margin:0 auto"><span class="placeholder">Replace with an approved quote from a {name.lower()} customer</span><blockquote>“[One sentence from a real customer about the biggest change.]”</blockquote><figcaption><span class="ph" aria-hidden="true"></span><span><b>[Name]</b>[Role], [Venue]</span></figcaption></figure></div></section>
<section class="section tight"><div class="wrap"><p class="small muted" style="margin-bottom:12px">Other venue types</p><div class="chips">{others}</div></div></section>''' + cta()
    ld = [crumbs_ld([("Home", "home"), ("Solutions", "solutions"), (name, slug)])]
    return doc(slug, d["title"], d["desc"], body, ld, active="solutions")

def solutions_hub():
    body = page_hero([("Home", "home"), ("Solutions", "solutions")], "Solutions", "Restaurant software shaped around your venue",
        "Every kind of venue has its own rush, its own leaks and its own numbers that matter. Pick yours.", actions=False)
    body += f'<section class="section bg-soft" id="more"><div class="wrap">{solution_cards()}</div></section>' + cta()
    return doc("solutions", "Restaurant Software for Bars, Cafés, Cloud Kitchens & Chains | Digitory",
               "Digitory solutions for breweries and bars, cafés and QSR, fine dining, cloud kitchens, restaurant chains and clubs and events.", body,
               [crumbs_ld([("Home", "home"), ("Solutions", "solutions")])])

# ======================= CUSTOMERS =======================
def customers():
    names = "".join(f'<div class="card" style="align-items:center;justify-content:center;min-height:110px;font-size:20px;font-weight:600;color:#7A8899">{c}</div>' for c in CLIENTS + ["[Logo]", "[Logo]", "[Logo]"])
    story = lambda v: f'''<article class="card"><span class="placeholder">Case study to be written with the client</span><span class="eyebrow" style="font-size:12px">{v}</span><h3>[Headline result, e.g. “Cut bar variance in half in 90 days”]</h3>
<p class="muted"><b style="color:var(--ink)">Before:</b> [the problem in one line]</p><p class="muted"><b style="color:var(--ink)">With Digitory:</b> [what changed]</p><p class="muted"><b style="color:var(--ink)">Result:</b> [measured outcome]</p></article>'''
    body = page_hero([("Home", "home"), ("Customers", "customers")], "Customers", "Trusted by some of India’s busiest venues",
        "Breweries, bars, cafés and restaurant groups run their nights on Digitory. Here are a few of them.", actions=False)
    body += f'''<section class="section bg-soft" id="more"><div class="wrap"><div class="grid g4">{names}</div></div></section>
{stats_band()}
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">Customer stories</span><h2>Results, in their words</h2></div>
<div class="grid g3">{story("Brewery")}{story("Restaurant group")}{story("Café chain")}</div></div></section>''' + cta()
    return doc("customers", "Customers | Restaurants, Breweries & Bars on Digitory",
               "See how breweries, bars, cafés and restaurant groups across India use Digitory to run faster service, tighter stock and clearer numbers.", body,
               [crumbs_ld([("Home", "home"), ("Customers", "customers")])])

# ======================= ABOUT =======================
def about():
    team = [("Shiv Mogali", "Founder and CEO"), ("Sudhanshu Killedar", "[Role]"), ("Bala Sundrasamy", "[Role]"), ("Ashish Sharnagat", "[Role]"), ("Sandeep S", "[Role]"), ("Panjury V", "[Role]")]
    team_html = "".join(f'<div class="person"><div class="ph">[Photo]</div><b>{n}</b><span class="muted small">{r}</span></div>' for n, r in team)
    values = [("Built on the floor", "We design features by standing behind the bar and in the kitchen, not in meeting rooms."),
              ("Reliable before clever", "The bill has to print on a Saturday night. Everything else comes second."),
              ("Honest numbers", "One version of the truth, from the order to the accounts."),
              ("Here after go-live", "Onboarding is the start of the relationship, not the end of the sale.")]
    val_html = "".join(f'<div class="card"><h3>{t}</h3><p class="muted">{d}</p></div>' for t, d in values)
    body = f'''<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="{L("home")}">Home</a> / <span aria-current="page">About</span></nav>
<span class="eyebrow">About Digitory</span><h1>Built with restaurants, from day one</h1>
<p class="lede">Digitory started in Bengaluru with a simple idea: a restaurant should run on one system, not five. Today more than 1,000 clients across 10 cities and 3 countries bill, cook, stock and serve on Digitory.</p></div>
<div style="display:flex;justify-content:center"><img src="{A("digo.webp")}" alt="DIGO, the Digitory mascot, waving hello" width="360" height="360" style="width:min(340px,80vw);filter:drop-shadow(0 30px 40px rgba(34,51,69,.25))"></div>
</div></section>
<section class="section bg-soft"><div class="wrap split">
<div style="display:flex;flex-direction:column;gap:20px"><span class="eyebrow">Our story</span><h2>From one restaurant’s problem to an operating system</h2></div>
<div style="display:flex;flex-direction:column;gap:18px"><p class="lede">[Founding story in two or three short paragraphs: the year, the first customer, the problem that started it.]</p>
<p class="muted">Along the way we built billing, kitchen display, inventory, purchasing, CRM, reservations and cashless wallets, all on one platform, because our customers kept asking us to connect the next thing.</p>
<p class="muted">Digitory is a winner of Karnataka’s K-tech Elevate programme.</p></div></div></section>
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">What we believe</span><h2>How we build</h2></div><div class="grid g4">{val_html}</div></div></section>
{stats_band()}
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">Leadership</span><h2>The team behind Digitory</h2></div><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));max-width:820px">{team_html}</div></div></section>
<section class="section bg-warm"><div class="wrap split">
<div style="display:flex;justify-content:center"><img src="{A("digo.webp")}" alt="" width="360" height="360" loading="lazy" style="width:min(260px,60vw);transform:scaleX(-1)"></div>
<div style="display:flex;flex-direction:column;gap:18px"><span class="eyebrow">Say hello to DIGO</span><h2>Our mascot, and your guide</h2><p class="lede">DIGO wears the Digitory mark on his chest and shows up wherever you need a hand: during onboarding, in our help guides and when something needs your attention.</p></div>
</div></section>''' + cta("Want to see it for yourself?", "Book a walkthrough, or come and meet the team in Bengaluru.")
    return doc("about", "About Digitory | Restaurant Technology from Bengaluru",
               "Digitory is a Bengaluru restaurant technology company running billing, kitchen, inventory and guest operations for 1,000+ clients across 10 cities.", body,
               [crumbs_ld([("Home", "home"), ("About", "about")])])

# ======================= DEMO =======================
def demo():
    opts = "".join(f'<option value="{SLUG_TO_VENUE[s]}">{t}</option>' for s, _, t, _ in SOLUTIONS) + "<option value=\"other\">Other</option>"
    body = f'''<section class="page-hero"><div class="wrap split" style="align-items:start">
<div class="hero-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="{L("home")}">Home</a> / <span aria-current="page">Book a demo</span></nav>
<span class="eyebrow">Book a demo</span><h1>See Digitory on a menu like yours</h1>
<p class="lede">Tell us a little about your venue. We’ll call to understand how you run today, then show you the parts of Digitory that matter to you.</p>
<ol class="flow" style="padding:0;margin:8px 0 0"><li><b>A short call</b><span>15 minutes to understand your venue.</span></li><li><b>Your demo</b><span>30 minutes, on your kind of menu.</span></li><li><b>A clear plan</b><span>Modules, hardware and a go-live date.</span></li></ol>
<div style="display:flex;align-items:center;gap:16px;margin-top:8px"><img class="digo-inline" src="{A("digo.webp")}" alt="DIGO, the Digitory mascot" width="120" height="120"><p class="muted small">Prefer to talk now? Call <a href="tel:+917022511122"><b>+91 70225 11122</b></a> or write to <a href="mailto:info@digitory.com"><b>info@digitory.com</b></a>.</p></div>
</div>
<div class="card form-wrap" style="padding:clamp(24px,3vw,36px);box-shadow:0 30px 60px -30px rgba(34,51,69,.3)">
<h2 style="font-size:24px;margin-bottom:8px">Request a demo</h2>
<form class="form" data-demo action="/api/demo" method="post" novalidate>
<div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" autocomplete="name" required></div>
<div class="field"><label for="f-phone">Mobile number</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required></div>
<div class="field full"><label for="f-email">Work email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
<div class="field"><label for="f-venue">Venue or brand name</label><input id="f-venue" name="venue" autocomplete="organization" required></div>
<div class="field"><label for="f-city">City</label><input id="f-city" name="city" autocomplete="address-level2"></div>
<div class="field"><label for="f-type">Type of venue</label><select id="f-type" name="type">{opts}</select></div>
<div class="field"><label for="f-outlets">Number of outlets</label><select id="f-outlets" name="outlets"><option>1</option><option>2–5</option><option>6–20</option><option>21–50</option><option>50+</option></select></div>
<div class="field full"><label for="f-msg">Anything we should know? (optional)</label><textarea id="f-msg" name="message" rows="3"></textarea></div>
<div class="full"><button class="btn btn-primary" type="submit" style="width:100%">Request my demo {ARROW}</button><p class="small muted mt-8">We’ll only use your details to arrange the demo.</p></div>
</form>
<p class="form-ok" role="status">Thank you. We’ve got your request and will call you within one working day.</p>
</div></div></section>'''
    return doc("demo", "Book a Demo | Digitory Restaurant POS & Management Software",
               "Book a free demo of Digitory. See billing, kitchen display, inventory and CRM on a menu like yours, and get a clear plan for going live.", body,
               [crumbs_ld([("Home", "home"), ("Book a demo", "demo")])])

def notfound():
    body = f'''<section class="section"><div class="wrap" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px">
<img src="{A("digo.webp")}" alt="DIGO, the Digitory mascot" width="220" height="220">
<span class="eyebrow">Error 404</span><h1 style="font-size:clamp(34px,5vw,56px)">This table isn’t on our floor plan</h1>
<p class="lede">The page you’re looking for has moved or never existed. Let’s get you seated somewhere better.</p>
<div class="actions" style="justify-content:center"><a class="btn btn-primary" href="{L("home")}">Go to the homepage</a><a class="btn btn-ghost" href="{L("demo")}">Book a demo</a></div></div></section>'''
    return doc("404", "Page not found | Digitory", "The page you are looking for could not be found.", body)

PAGES = {"digitalk": digitalk, "solutions": solutions_hub, "customers": customers, "about": about, "demo": demo, "404": notfound}
for s in SOL: PAGES[s] = (lambda s=s: solution(s))
