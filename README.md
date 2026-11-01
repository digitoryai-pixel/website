# Digitory website (AI agent platform)

Staging copy of the new Digitory website, with interactive AI agent simulations and the Managed Inventory pages.

- The pages in this folder are the built site (19 pages). They are marked `noindex` so search engines ignore this staging copy.
- `_source/` holds the generator. Copy and page text live in the `.py` files; styles in `_source/assets/site.css`; the simulations in `_source/assets/sim.js`.

## Rebuild

`build.py` empties its output folder before writing, so always build into a separate folder:

```
cd _source
python3 build.py /tmp/site-static static   # staging build (relative links, noindex)
cp -r /tmp/site-static/. ..                # copy the pages over this staging copy
python3 build.py /tmp/site-prod prod       # production build for www.digitory.com (clean URLs, sitemap, robots, vercel.json)
```
