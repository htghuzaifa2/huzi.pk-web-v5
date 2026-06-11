# Cloudflare Pages Deployment Guide

This project is configured for Cloudflare using the OpenNext adapter and a Pages advanced-mode output in `.open-next/assets`.

## Prerequisites

- Node.js 20+
- npm
- A Cloudflare account

## Dashboard Build Configuration

Use a custom build instead of the default Next.js preset.

| Setting | Value |
|---------|-------|
| Framework preset | `None` |
| Build command | `npm run pages:build` |
| Build output directory | `.open-next/assets` |
| Node.js version | `20` |

## Option 1: Deploy via Cloudflare Pages Dashboard

1. Push this repo to GitHub or GitLab.
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/), open `Workers & Pages`.
3. Click `Create application` and connect the repository.
4. Set the build configuration shown above.
5. Save and deploy.

Notes:

- `wrangler.toml` already enables `nodejs_compat`.
- The build emits `.open-next/assets/_worker.js`, which Pages uses for the worker runtime.
- Do not use `.next` or `.vercel/output/static` for this repo.

## Option 2: Deploy via Wrangler CLI

```bash
# Install dependencies
npm install

# Build the OpenNext Pages output
npm run pages:build

# Deploy the generated Pages bundle
npm run pages:deploy
```

If you need to deploy manually, the equivalent command is:

```bash
wrangler pages deploy .open-next/assets --project-name=huzi-pk
```

## Local Preview

```bash
npm install
npm run pages:build
npm run pages:dev
```

## Custom Domains

After deployment:

1. Open the Cloudflare Pages project.
2. Add `huzi.pk` and `www.huzi.pk` under `Custom domains`.
3. Apply the DNS records Cloudflare provides.

## Environment Variables

No runtime environment variables are currently required.

If that changes later, add them in Cloudflare Pages project settings before deploying.
