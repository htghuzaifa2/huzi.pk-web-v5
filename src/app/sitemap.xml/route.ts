

export const dynamic = 'force-static';

const siteUrl = 'https://huzi.pk';

export async function GET() {
    const sitemaps = ['/pages.xml', '/product.xml', '/categories.xml', '/blogs-sitemap.xml'];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
            .map((route) => {
                return `
  <sitemap>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
            })
            .join("")}
</sitemapindex>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
