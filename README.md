# huzi.pk

> Pakistan's online store for fashion, beauty & tech — built with Next.js, deployed on Cloudflare Pages.

## What This Is

This is the source code for [huzi.pk](https://huzi.pk), an e-commerce storefront that sells Pakistani fashion products (lawn suits, bridal dresses, silk/chiffon/velvet outfits, makeup, skincare, fragrances) and a small selection of tech products. Orders are placed through WhatsApp — there is no payment gateway or backend database. The entire site is statically generated at build time.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Language | TypeScript |
| Data | Static JSON files + Markdown blog posts |
| Hosting | Cloudflare Pages |
| Fonts | Alegreya (body), Belleza (headings) |

## Pages

The build generates **2,817 static pages**:

| Route | Count | Description |
|-------|-------|-------------|
| `/product/[slug]` | 1,103 | Each product gets its own page with images, specs, price, stock status, and JSON-LD structured data for SEO |
| `/blog/[topic]/[slug]` | 1,656 | Blog posts across 6 topics: products, guides, tech, sports, design, updates |
| `/category/[slug]` | 25 | Category listing pages with product grids |
| Static pages | 33 | Home, about, checkout, contact, FAQ, policies, search, sale, etc. |
| Sitemaps | 5 | `sitemap.xml`, `product.xml`, `products.xml`, `categories.xml`, `blogs-sitemap.xml` |

## Project Structure

```
src/
  app/              Next.js App Router pages & API routes
  components/       React components (UI primitives in ui/)
  context/          React context providers (cart, theme, search)
  data/             Static data — products.json, categories.json, locations.json, blogs/posts/
  lib/              Utility functions & data loaders
  styles/           CSS modules (blog styles, theme, animations)
public/
  images/           Blog cover images
  _headers          Cloudflare Pages caching headers
  _redirects        Cloudflare Pages redirect rules (tool, games, webp subdomains)
  prefetch.js       Smart external link prefetcher
  robots.txt
```

## Data Architecture

There is **no database**. All data lives in the repo:

- `src/data/products.json` (2.2 MB) — 1,103 products with slug, name, price, description, longDescription, specifications, category, image, additionalImages, stock
- `src/data/categories.json` — 25 categories
- `src/data/locations.json` — Pakistan provinces/cities for checkout
- `src/data/blogs/posts/{topic}/*.md` — 1,656 markdown blog posts with frontmatter

Products and categories are imported directly as JSON (bundled at build time). Blog posts are read from markdown files at build time using `src/lib/blog.ts` (which uses Node.js `fs` — this is safe because all blog pages have `export const dynamic = 'force-static'`, so they only run during the build).

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Production build (generates all 2,817 pages)
```

## Deploy to Cloudflare Pages

This repo already uses the OpenNext Cloudflare adapter. Do not use the older Next.js-on-Pages output paths like `.vercel/output/static`.

Recommended Cloudflare Pages build settings:

- **Framework preset:** `None`
- **Build command:** `npm run pages:build`
- **Build output directory:** `.open-next/assets`
- **Compatibility flag:** `nodejs_compat` (set in `wrangler.toml`)

Or deploy from CLI:

```bash
npm run pages:deploy
```

That build generates `.open-next/assets/_worker.js`, which Cloudflare Pages uses in advanced mode, plus the static asset directory.

See [DEPLOY.md](./DEPLOY.md) for the full deployment checklist.

## Redirects

The following routes redirect to sub-services (configured in `public/_redirects`):

| Path | Target |
|------|--------|
| `/tool`, `/tools` | `tool.huzi.pk` |
| `/game`, `/games` | `games.huzi.pk` |
| `/webp` | `webp.huzi.pk` |
| `/blogs` | `blogs.huzi.pk` |
| `/ads.txt` | Adstxtmanager |

## SEO

- Every product page includes JSON-LD structured data (Product schema with price, availability, SKU)
- Auto-generated sitemaps for all pages, products, categories, and blog posts
- OpenGraph and Twitter card metadata on all key pages
- `robots.txt` with sitemap reference
- Unoptimized images (required for Cloudflare Pages — no Sharp)

## License

Private. All rights reserved.
