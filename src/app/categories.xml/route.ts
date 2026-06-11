
import { MetadataRoute } from 'next';
import categoriesData from '@/data/categories.json';


export const dynamic = 'force-static';

const siteUrl = 'https://huzi.pk';

function generateSitemap(categories: any[]): string {
  const categoryEntries = categories
    .map(category => `
    <url>
      <loc>${siteUrl}/category/${category.slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categoryEntries}
</urlset>`;
}

export async function GET() {
  const sitemap = generateSitemap(categoriesData.categories);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
