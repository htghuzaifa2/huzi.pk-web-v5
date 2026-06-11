
import { MetadataRoute } from 'next';


export const dynamic = 'force-static';

const siteUrl = 'https://huzi.pk';

export async function GET() {
  const staticPages = [
    '/',
    '/about',
    '/all-products',
    '/categories',
    '/contact',
    '/faq',
    '/how-to-pay',
    '/shipping-policy',
    '/return-policy',
    '/cash-on-delivery',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1 : 0.8,
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
      .map((page) => {
        return `
    <url>
      <loc>${page.url}</loc>
      <lastmod>${page.lastModified.toISOString()}</lastmod>
      <changefreq>${page.changeFrequency}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `;
      })
      .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

