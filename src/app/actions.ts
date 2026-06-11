'use server';

import productsData from '@/data/products.json';
import type { Product } from '@/lib/types';

export async function fetchProducts({
  page = 1,
  limit = 25,
  category,
  sortBy = 'newest',
  randomize = false,
}: {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: string;
  randomize?: boolean;
}) {
  let productsToProcess: Product[] = [...productsData];

  if (category) {
    productsToProcess = productsToProcess.filter(p => p.category.includes(category));
  }

  if (randomize) {
    // Shuffle the array for random order
    for (let i = productsToProcess.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [productsToProcess[i], productsToProcess[j]] = [productsToProcess[j], productsToProcess[i]];
    }
  } else {
    // Sorting logic based on sortBy parameter
    switch (sortBy) {
      case 'newest':
        productsToProcess.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        productsToProcess.sort((a, b) => a.id - b.id);
        break;
      case 'price-asc':
        productsToProcess.sort((a, b) => a.price - a.price);
        break;
      case 'price-desc':
        productsToProcess.sort((a, b) => b.price - a.price);
        break;
      default:
        productsToProcess.sort((a, b) => b.id - a.id);
        break;
    }
  }
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const products = productsToProcess.slice(start, end);

  return {
    products,
    total: productsToProcess.length
  };
}

export async function fetchFeaturedProducts() {
  let productsToProcess: Product[] = [...productsData];

  // Shuffle the array for random order
  for (let i = productsToProcess.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [productsToProcess[i], productsToProcess[j]] = [productsToProcess[j], productsToProcess[i]];
  }

  const products = productsToProcess.slice(0, 10);
  
  return products;
}