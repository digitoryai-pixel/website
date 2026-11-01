import os, shutil, sys, importlib
import core
OUT = sys.argv[1]; core.MODE = sys.argv[2]
import pages_main, pages_more, agents
import managed
P = {**pages_main.PAGES, **pages_more.PAGES, 'ai': agents.ai_page, 'managed': managed.managed_page}
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT + "/assets")
for f in ["site.css", "site.js", "dashboard.webp", "digo.webp", "lockup_navy.png", "lockup_white.png", "favicon.png", "apple-touch-icon.png", "og-image.jpg", "ai-ecosystem.webp", "sim.js"]:
    shutil.copy("assets/" + f, OUT + "/assets/" + f)
for slug, fn in P.items():
    html = fn()
    if core.MODE in ("preview", "static"):
        path = core.ROUTES[slug][0]
    else:
        p = core.ROUTES[slug][1]
        path = "index.html" if p == "/" else p.lstrip("/") + ".html"
    os.makedirs(os.path.dirname(OUT + "/" + path) or OUT, exist_ok=True)
    open(OUT + "/" + path, "w").write(html)
if core.MODE == "prod":
    urls = [core.url(s) for s in P if s != "404"]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
        f"  <url><loc>{u}</loc><lastmod>2026-10-30</lastmod><priority>{'1.0' if u == core.DOMAIN else '0.8'}</priority></url>\n" for u in urls) + "</urlset>\n"
    open(OUT + "/sitemap.xml", "w").write(sm)
    open(OUT + "/robots.txt", "w").write(f"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {core.DOMAIN}/sitemap.xml\n")
    open(OUT + "/vercel.json", "w").write('{\n  "cleanUrls": true,\n  "trailingSlash": false,\n  "headers": [{"source": "/assets/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]}]\n}\n')
print(len(P), "pages ->", OUT)
