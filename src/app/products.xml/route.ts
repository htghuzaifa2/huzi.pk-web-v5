
import productsData from '@/data/products.json';
import type { Product } from '@/lib/types';


export const dynamic = 'force-static';

const siteUrl = 'https://huzi.pk';

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function generateProductFeed(products: Product[]): string {
  const productEntries = products.map(product => {
    const availability = product.stock !== undefined && product.stock <= 0 ? 'out of stock' : 'in stock';

    // This can be made more sophisticated later if needed
    const googleProductCategory = 'Apparel & Accessories > Clothing';

    const additionalImages = product.additionalImages.map(img =>
      `<g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`
    ).join('\n      ');

    return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.description)}</g:description>
      <g:link>${siteUrl}/product/${product.slug}</g:link>
      <g:image_link>${escapeXml(product.image.url)}</g:image_link>
      ${additionalImages}
      <g:availability>${availability}</g:availability>
      <g:price>${product.price.toFixed(2)} PKR</g:price>
      <g:condition>new</g:condition>
      <g:google_product_category>${escapeXml(googleProductCategory)}</g:google_product_category>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>huzi.pk</title>
    <link>${siteUrl}</link>
    <description>Product feed for huzi.pk</description>${productEntries}
  </channel>
</rss>`;
}

export async function GET() {
  const products: Product[] = productsData;
  const feed = generateProductFeed(products);

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
