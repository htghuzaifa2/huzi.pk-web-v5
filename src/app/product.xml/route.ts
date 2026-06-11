
import productsData from '@/data/products.json';

export const dynamic = 'force-static';

const siteUrl = 'https://huzi.pk';

export async function GET() {
  const productEntries = productsData.map(product => `
    <url>
      <loc>${siteUrl}/product/${product.slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${productEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
