"use client";

import { useState, useMemo, useEffect, useCallback, ChangeEvent } from "react";
import ProductCard from "@/components/product-card";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { useProductsData } from "@/hooks/use-products-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

const PAGE_SIZE = 25;

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { products: allProducts, isLoading: isDataLoading } = useProductsData();

  const [query, setQuery] = useState(initialQuery);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedQuery = useDebounce(query, 150);

  const filteredProducts = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim();

    if (!trimmedQuery || isDataLoading) {
      return [];
    }

    if (/^\d+$/.test(trimmedQuery)) {
      const productId = parseInt(trimmedQuery, 10);
      return allProducts.filter(p => p.id === productId);
    }

    const lowercasedQuery = trimmedQuery.toLowerCase();

    const startsWith = allProducts.filter(p =>
      p.name.toLowerCase().startsWith(lowercasedQuery)
    );

    const contains = allProducts.filter(p =>
      !p.name.toLowerCase().startsWith(lowercasedQuery) &&
      p.name.toLowerCase().includes(lowercasedQuery)
    );

    return [...startsWith, ...contains];
  }, [debouncedQuery, allProducts, isDataLoading]);

  useEffect(() => {
    setIsLoading(true);
    setVisibleCount(PAGE_SIZE);
    setDisplayedProducts(filteredProducts.slice(0, PAGE_SIZE));
    setIsLoading(false);
  }, [filteredProducts]);

  const loadMore = useCallback(() => {
    const newVisibleCount = visibleCount + PAGE_SIZE;
    setVisibleCount(newVisibleCount);
    setDisplayedProducts(filteredProducts.slice(0, newVisibleCount));
  }, [visibleCount, filteredProducts]);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }

  const hasMore = visibleCount < filteredProducts.length;

   useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);


  return (
    <div className="container mx-auto px-4 py-12 content-fade-in">
      <h1 className="mb-4 text-center font-headline text-4xl font-bold">
        Search Products
      </h1>

      {initialQuery ? (
        <>
          <h3 className="mb-8 text-center text-lg text-muted-foreground">
            Showing results for: <span className="font-semibold text-foreground">"{initialQuery}"</span>
          </h3>

          {(isLoading || isDataLoading) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => <ProductCard key={`skel-${i}`} product={null} />)}
            </div>
          ) : displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button onClick={loadMore} size="lg">
                    Load More
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-16">No products found</p>
          )}
        </>
      ) : (
         <p className="text-center text-muted-foreground">Please enter a search term to find products.</p>
      )}
    </div>
  );
}
