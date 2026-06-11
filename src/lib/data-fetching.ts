
import productsData from "@/data/products.json";
import type { Product } from "./types";

export async function getProductData(slug: string) {
  await new Promise(resolve => setTimeout(resolve, 0)); // Simulate async fetch

  const allProducts: Product[] = productsData;
  const product = allProducts.find((p) => p.slug === slug) || null;

  if (!product) {
    return { product: null, relatedProducts: [] };
  }

  // 1. Get all products from the same category, excluding the current one.
  const sameCategoryProducts = allProducts.filter(p => 
    p.id !== product.id && 
    p.category.some(cat => product.category.includes(cat))
  );

  // Shuffle them to show a different order each time.
  const shuffledSameCategory = sameCategoryProducts.sort(() => 0.5 - Math.random());

  let relatedProducts = shuffledSameCategory.slice(0, 10);

  // 2. If we still don't have 10 products, fill the rest with random products.
  if (relatedProducts.length < 10) {
    const needed = 10 - relatedProducts.length;
    const currentIds = new Set(relatedProducts.map(p => p.id).concat(product.id));
    
    const randomProducts = allProducts
      .filter(p => !currentIds.has(p.id)) // Exclude already selected products and the main product
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, needed);
      
    relatedProducts = [...relatedProducts, ...randomProducts];
  }

  return { product, relatedProducts };
}
