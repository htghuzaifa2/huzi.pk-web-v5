"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/types";

// Module-level cache so all components share one fetch
let cachedProducts: Product[] | null = null;
let fetchPromise: Promise<Product[]> | null = null;

async function fetchProducts(): Promise<Product[]> {
  if (cachedProducts) return cachedProducts;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/products")
    .then((res) => res.json())
    .then((data: Product[]) => {
      cachedProducts = data;
      fetchPromise = null;
      return data;
    })
    .catch((err) => {
      console.error("Failed to fetch products:", err);
      fetchPromise = null;
      return [] as Product[];
    });

  return fetchPromise;
}

/**
 * Hook to fetch products from API instead of importing the 2.3MB JSON.
 * Shares a single fetch across all components on the page.
 */
export function useProductsData() {
  const [products, setProducts] = useState<Product[]>(cachedProducts || []);
  const [isLoading, setIsLoading] = useState(!cachedProducts);

  useEffect(() => {
    if (cachedProducts) {
      setProducts(cachedProducts);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchProducts().then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  return { products, isLoading };
}
