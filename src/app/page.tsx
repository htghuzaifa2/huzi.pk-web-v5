
import HomeLoader from './home-loader';
import type { Metadata } from 'next';
import productsData from '@/data/products.json';
import Script from 'next/script';

const siteConfig = {
  name: "huzi.pk",
  url: "https://huzi.pk",
  title: "huzi.pk | Quality & Style, Delivered in Pakistan",
  description: "Huzi.pk: Your trusted hub for premium quality Pakistani Fashion & Tech Products. Shop confidently with nationwide delivery. Digital Products & E-Books available worldwide! Find quality and style. Shop Now!",
};

// Homepage inherits title from root layout: "Huzi.pk | Quality & Style, Delivered in Pakistan"
// No metadata override needed - Huzi.pk appears first as requested

export default function Home() {
  const featuredProducts = productsData.slice(0, 5);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": siteConfig.url,
    "name": siteConfig.name,
    "description": siteConfig.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": [
      ...featuredProducts.map(product => ({
        "@type": "Product",
        "name": product.name,
        "image": product.image.url,
        "description": product.description,
        "url": `${siteConfig.url}/product/${product.slug}`,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "PKR"
        }
      }))
    ]
  };

  return (
    <>
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeLoader />
    </>
  );
}
