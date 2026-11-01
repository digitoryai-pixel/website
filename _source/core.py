import json, html as H

DOMAIN = "https://www.digitory.com"
MODE = "prod"  # or "preview"

# slug -> (preview file, production path)
ROUTES = {
    "home": ("index.html", "/"),
    "platform": ("platform.html", "/platform"),
    "pos": ("pos.html", "/pos"),
    "inventory": ("inventory.html", "/inventory"),
    "guests": ("guests.html", "/guests"),
    "digitalk": ("digitalk.html", "/digitalk"),
    "ai": ("ai.html", "/ai"),
    "managed": ("managed-inventory.html", "/managed-inventory"),
    "solutions": ("solutions.html", "/solutions"),
    "s-bars": ("solutions-breweries-bars.html", "/solutions/breweries-bars"),
    "s-cafes": ("solutions-cafes-qsr.html", "/solutions/cafes-qsr"),
    "s-fine": ("solutions-fine-dining.html", "/solutions/fine-dining"),
    "s-cloud": ("solutions-cloud-kitchens.html", "/solutions/cloud-kitchens"),
    "s-chains": ("solutions-chains.html", "/solutions/chains"),
    "s-events": ("solutions-clubs-events.html", "/solutions/clubs-events"),
    "customers": ("customers.html", "/customers"),
    "about": ("about.html", "/about"),
    "demo": ("demo.html", "/demo"),
    "404": ("404.html", "/404"),
}

def L(slug, frag=""):
    f, p = ROUTES[slug]
    return (f if MODE in ("preview", "static") else p) + frag

VER = ""
def A(path):
    return ("assets/" if MODE in ("preview", "static") else "/assets/") + path

def url(slug):
    p = ROUTES[slug][1]
    return DOMAIN + ("" if p == "/" else p)

# ---------- icons (24px stroke) ----------
I = {
 "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
 "chev": '<path d="M6 9l6 6 6-6"/>',
 "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
 "receipt": '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 "screen": '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 "box": '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
 "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
 "chart": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 "spark": '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
 "wifi": '<path d="M2 8.5a15 15 0 0120 0M5.5 12a10 10 0 0113 0M9 15.5a5 5 0 016 0"/><circle cx="12" cy="19" r="1"/>',
 "rupee": '<path d="M6 4h12M6 9h12M6 4h3a5 5 0 010 10H6l8 6"/>',
 "layers": '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
 "hand": '<path d="M7 11V6a2 2 0 014 0v4M11 10V4a2 2 0 014 0v6M15 10V6a2 2 0 014 0v8a7 7 0 01-7 7h-1a7 7 0 01-6-3.4L3 14a2 2 0 013.3-2.2L7 13"/>',
 "qr": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7h-4M17 21h-3"/>',
 "bike": '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17l4-8h5l4 8M9 6h3"/>',
 "chef": '<path d="M6 14a4 4 0 01-1-7.9A5 5 0 0112 3a5 5 0 017 3.1A4 4 0 0118 14"/><path d="M6 14h12v6H6z"/>',
 "truck": '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
 "scale": '<path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 006 0L5 7zM19 7l-3 7a4 4 0 006 0l-3-7z"/>',
 "heart": '<path d="M12 20s-7-4.4-9-9.2C1.6 7.2 4 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4 20 4 22.4 7.2 21 10.8 19 15.6 12 20 12 20z"/>',
 "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 "star": '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.4 6.4 20.4l1.1-6.3L3 9.7l6.2-.9z"/>',
 "wallet": '<path d="M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7l12-4v4"/><circle cx="16.5" cy="13.5" r="1.2"/>',
 "shield": '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 "building": '<path d="M4 21V5l8-2v18M12 7l8 3v11M2 21h20M8 8v.01M8 12v.01M8 16v.01M16 13v.01M16 17v.01"/>',
 "beer": '<path d="M5 8h11v11a2 2 0 01-2 2H7a2 2 0 01-2-2zM16 10h2a2 2 0 012 2v3a2 2 0 01-2 2h-2"/><path d="M5 8a3 3 0 013-4 3.5 3.5 0 016 0 3 3 0 013 4"/>',
 "coffee": '<path d="M4 9h12v6a5 5 0 01-5 5H9a5 5 0 01-5-5zM16 10h1.5a2.5 2.5 0 010 5H16"/><path d="M8 3v3M12 3v3"/>',
 "dine": '<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 2-3 4.5-3 8h3v10"/>',
 "cloud": '<path d="M7 18a4.5 4.5 0 01-.5-9A6 6 0 0118 8a4.5 4.5 0 01-.5 10z"/>',
 "music": '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
 "phone": '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>',
 "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 "pin": '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 "check": '<path d="M5 12l4 4 10-10"/>',
 "bell": '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>',
 "link": '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
}
def ic(name, cls=""):
    return f'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"{(" class=%s" % cls) if cls else ""}>{I[name]}</svg>'

def icon_box(name, navy=False):
    return f'<span class="icon{" navy" if navy else ""}">{ic(name)}</span>'

ARROW = ic("arrow")

# ---------- shared content ----------
STATS = [("600<em>+</em>", "outlets run on Digitory"), ("10", "cities in India, plus 3 countries"),
         ("₹1,000 Cr<em>+</em>", "billed through Digitory every year"), ("100K<em>+</em>", "guest check-ins every day")]
CLIENTS = ["Toit", "BygBrewski", "Windmills", "Plan B", "Hard Rock Cafe"]

SOLUTIONS = [
 ("s-bars", "beer", "Breweries, pubs and bars", "Bottle and peg stock, excise registers, happy-hour pricing and a bar that never waits on the system."),
 ("s-cafes", "coffee", "Cafés and QSR", "Fast counter billing, QR ordering and delivery apps in one queue, with loyalty that brings regulars back."),
 ("s-fine", "dine", "Fine dining", "Reservations, guest notes and course timing, so service feels personal from the door to the bill."),
 ("s-cloud", "cloud", "Cloud kitchens", "Many brands from one kitchen, every aggregator in one screen, and food cost you can trust."),
 ("s-chains", "building", "Chains and central kitchens", "One menu, one purchase plan and one view of every outlet, from five locations to fifty."),
 ("s-events", "music", "Clubs and events", "Cashless wallets, ticketing and entry, and bars that stay fast when the crowd peaks."),
]

PLATFORM = [
 ("pos", "receipt", "Sell", "POS and billing", "Billing, kitchen display, QR ordering and delivery orders, all in one flow."),
 ("inventory", "box", "Stock", "Inventory and purchasing", "Recipes, live stock, indents, purchase orders and vendor prices."),
 ("guests", "users", "Guests", "CRM, loyalty and reservations", "Guest profiles, rewards, bookings, feedback and cashless wallets."),
 ("digitalk", "chart", "Know", "Reports and DigiTalk AI", "Live dashboards for every outlet, and an assistant you can ask."),
]

def nav(active):
    def a(slug, label):
        cur = ' aria-current="page"' if slug == active else ""
        return f'<a href="{L(slug)}"{cur}>{label}</a>'
    plat = "".join(f'<a href="{L(s)}"><b>{t}</b><span>{d}</span></a>' for s, _, _, t, d in PLATFORM)
    plat += f'<a href="{L("managed")}"><b>Managed Inventory</b><span>Our experts run your stock control with you</span></a>'
    plat += f'<a href="{L("platform")}"><b>See the whole platform</b><span>How every module connects</span></a>'
    sol = "".join(f'<a href="{L(s)}"><b>{t}</b><span>{d.split(",")[0]}</span></a>' for s, _, t, d in SOLUTIONS)
    return f'''<header class="site-header">
<a class="skip" href="#main">Skip to content</a>
<div class="wrap nav">
  <a class="brand" href="{L("home")}" aria-label="Digitory home"><img src="{A("lockup_navy.png")}" alt="Digitory" width="121" height="34"></a>
  <ul class="nav-links" id="nav-links">
    <li><details><summary>Platform {ic("chev")}</summary><div class="menu">{plat}</div></details></li>
    <li><details><summary>Solutions {ic("chev")}</summary><div class="menu">{sol}</div></details></li>
    <li>{a("ai","AI agents <span class=nav-new>New</span>")}</li>
    <li>{a("customers","Customers")}</li>
    <li>{a("about","About")}</li>
  </ul>
  <div class="nav-cta">
    <a class="btn btn-ghost" href="tel:+917022511122">Call sales</a>
    <a class="btn btn-primary" href="{L("demo")}">Book a demo</a>
    <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">{ic("menu")}</button>
  </div>
</div>
</header>'''

def footer():
    col = lambda title, items: f'<div><h4>{title}</h4><ul>' + "".join(f'<li><a href="{h}">{t}</a></li>' for t, h in items) + '</ul></div>'
    return f'''<footer class="site-footer">
<div class="wrap">
  <div class="foot-grid">
    <div class="foot-brand">
      <img src="{A("lockup_white.png")}" alt="Digitory" width="114" height="32" loading="lazy">
      <p>The restaurant operating system for India’s busiest kitchens, bars and cafés.</p>
      <p class="small">Digitory Solutions Pvt. Ltd.<br>Bengaluru, India</p>
    </div>
    {col("Platform", [("POS and billing", L("pos")), ("Kitchen display", L("pos","#kds")), ("Inventory", L("inventory")), ("CRM and loyalty", L("guests")), ("Reservations", L("guests","#reservations")), ("AI agents", L("ai")), ("Managed Inventory", L("managed")), ("DigiTalk", L("digitalk"))])}
    {col("Solutions", [(t, L(s)) for s, _, t, _ in SOLUTIONS])}
    {col("Company", [("About us", L("about")), ("Customers", L("customers")), ("Blog", "/blog"), ("Careers", "/careers"), ("Book a demo", L("demo"))])}
    <div><h4>Talk to us</h4><ul>
      <li><a href="tel:+917022511122">+91 70225 11122</a></li>
      <li><a href="mailto:info@digitory.com">info@digitory.com</a></li>
      <li><a href="https://www.linkedin.com/company/digitory" rel="noopener">LinkedIn</a></li>
      <li><a href="https://www.instagram.com/digitory" rel="noopener">Instagram</a></li>
    </ul></div>
  </div>
  <div class="foot-bottom"><span>© 2026 Digitory Solutions Pvt. Ltd. All rights reserved.</span><span><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms of use</a></span></div>
</div>
</footer>'''

ORG = {"@type": "Organization", "@id": DOMAIN + "/#org", "name": "Digitory", "legalName": "Digitory Solutions Pvt. Ltd.",
       "url": DOMAIN, "logo": DOMAIN + "/assets/lockup_navy.png", "email": "info@digitory.com", "telephone": "+91-70225-11122",
       "address": {"@type": "PostalAddress", "addressLocality": "Bengaluru", "addressRegion": "Karnataka", "addressCountry": "IN"},
       "sameAs": ["https://www.linkedin.com/company/digitory", "https://www.instagram.com/digitory"]}

def crumbs_ld(trail):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": url(s)} for i, (n, s) in enumerate(trail)]}

def faq_ld(faqs):
    return {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]}

def faq_html(faqs, title="Questions owners ask us"):
    items = "".join(f'<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>' for q, a in faqs)
    return f'''<section class="section bg-soft" aria-labelledby="faq-h"><div class="wrap">
<div class="head"><span class="eyebrow">FAQ</span><h2 id="faq-h">{title}</h2></div>
<div class="faq">{items}</div></div></section>'''

def cta(title="Let’s look at your restaurant together", text="A 30-minute walkthrough of the modules that matter to your venue, with time for your questions. No slides.", digo=True):
    img = f'<img src="{A("digo.webp")}" alt="DIGO, the Digitory mascot, waving" width="220" height="220" loading="lazy">' if digo else ""
    return f'''<section class="section tight"><div class="wrap"><div class="cta">
<div class="cta-copy"><h2>{title}</h2><p class="lede">{text}</p>
<div class="actions"><a class="btn btn-primary" href="{L("demo")}">Book a demo {ARROW}</a><a class="btn btn-ghost" href="tel:+917022511122">Call +91 70225 11122</a></div></div>
{img}</div></div></section>'''

def stats_band():
    s = "".join(f'<div class="stat"><b>{v}</b><span>{t}</span></div>' for v, t in STATS)
    return f'<section class="section tight bg-navy" aria-label="Digitory in numbers"><div class="wrap"><div class="stats">{s}</div></div></section>'

def solution_cards():
    return '<div class="grid g3">' + "".join(
        f'<a class="card" href="{L(s)}">{icon_box(i)}<h3>{t}</h3><p class="muted">{d}</p><span class="link">See how it works {ARROW}</span></a>'
        for s, i, t, d in SOLUTIONS) + '</div>'

def page_hero(trail, eyebrow, h1, lede, actions=True, extra=""):
    cr = " / ".join(f'<a href="{L(s)}">{n}</a>' for n, s in trail[:-1]) + f' / <span aria-current="page">{trail[-1][0]}</span>'
    act = f'<div class="actions"><a class="btn btn-primary" href="{L("demo")}">Book a demo {ARROW}</a><a class="btn btn-ghost" href="#more">See the details</a></div>' if actions else ""
    return f'''<section class="page-hero"><div class="wrap"><div class="hero-copy">
<nav class="crumbs" aria-label="Breadcrumb">{cr}</nav>
<span class="eyebrow">{eyebrow}</span><h1>{h1}</h1><p class="lede">{lede}</p>{act}{extra}</div></div></section>'''

def doc(slug, title, desc, body, ld=None, active=None):
    canon = url(slug)
    graph = [ORG] + (ld or [])
    ldj = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    robots = '<meta name="robots" content="noindex">' if (slug == "404" or MODE == "static") else '<meta name="robots" content="index,follow,max-image-preview:large">'
    head = f'''<title>{H.escape(title)}</title>
<meta name="description" content="{H.escape(desc)}">
{robots}
<link rel="canonical" href="{canon}">
<meta name="theme-color" content="#223345">
<meta property="og:type" content="website"><meta property="og:site_name" content="Digitory">
<meta property="og:title" content="{H.escape(title)}"><meta property="og:description" content="{H.escape(desc)}">
<meta property="og:url" content="{canon}"><meta property="og:image" content="{DOMAIN}/assets/og-image.jpg">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{H.escape(title)}"><meta name="twitter:description" content="{H.escape(desc)}"><meta name="twitter:image" content="{DOMAIN}/assets/og-image.jpg">
<link rel="icon" type="image/png" href="{A("favicon.png")}"><link rel="apple-touch-icon" href="{A("apple-touch-icon.png")}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&amp;display=swap">
<link rel="stylesheet" href="{A("site.css")}?v={VER}">
<script type="application/ld+json">{ldj}</script>'''
    inner = f'{nav(active or slug)}\n<main id="main">\n{body}\n</main>\n{footer()}\n<script src="{A("site.js")}?v={VER}" defer></script>\n<script src="{A("sim.js")}?v={VER}" defer></script>'
    if MODE == "preview" and slug == "home":
        return f'{head}\n<meta name="viewport" content="width=device-width,initial-scale=1">\n{inner}\n'
    return f'<!doctype html>\n<html lang="en-IN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n{head}\n</head>\n<body>\n{inner}\n</body>\n</html>\n'
