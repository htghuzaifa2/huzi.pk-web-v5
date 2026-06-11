'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ProductCard from './product-card';
import { ArrowDown } from 'lucide-react';
import { useProductsData } from '@/hooks/use-products-data';

const BATCH_SIZE = 25;

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <ProductCard key={`skeleton-${i}`} product={null} />
      ))}
    </div>
  );
}

export function ProductGridLoader({ category, sortBy, randomize = false, searchQuery }: { category?: string, sortBy?: string, randomize?: boolean, searchQuery?: string }) {
  const { products: productsData, isLoading: isDataLoading } = useProductsData();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchAndSetProducts = useCallback(
    (page: number, keepExisting = false) => {
      if (isDataLoading || productsData.length === 0) return;
      setIsLoading(true);

      let productsToProcess: Product[] = [...productsData];

      if (category) {
        productsToProcess = productsToProcess.filter(p => p.category.includes(category));
      }

      switch (sortBy) {
        case 'newest':
          productsToProcess.sort((a, b) => b.id - a.id);
          break;
        case 'oldest':
          productsToProcess.sort((a, b) => a.id - b.id);
          break;
        case 'price-asc':
          productsToProcess.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          productsToProcess.sort((a, b) => b.price - a.price);
          break;
        default:
          break;
      }

      const totalProducts = productsToProcess.length;
      const start = (page - 1) * BATCH_SIZE;
      const end = start + BATCH_SIZE;
      const newProducts = productsToProcess.slice(start, end);

      setProducts((prev) => {
        const currentProducts = keepExisting ? prev : [];
        const allProducts = [...currentProducts, ...newProducts];
        const productMap = new Map(allProducts.map(p => [p.id, p]));
        return Array.from(productMap.values());
      });

      setTotal(totalProducts);
      setHasMore(newProducts.length > 0 && (page * BATCH_SIZE) < totalProducts);
      setCurrentPage(page);
      setIsLoading(false);
    },
    [category, sortBy, randomize, productsData, isDataLoading]
  );

  useEffect(() => {
    if (searchQuery) return;

    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchAndSetProducts(1, false);
  }, [category, sortBy, randomize, searchQuery, fetchAndSetProducts]);

  const loadMoreProducts = () => {
    if (hasMore && !isLoading) {
      fetchAndSetProducts(currentPage + 1, true);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div>
        <ProductGridSkeleton />
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
     return (
       <div className="text-center py-16 text-muted-foreground">
          {searchQuery ? "No products found matching your search." : "No products found in this category."}
       </div>
     )
  }

  if(searchQuery) {
    return null;
  }

  return (
    <div>
       <div ref={gridRef} className="scroll-mt-20" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((p, i) => <ProductCard key={`${p.id}-${i}`} product={p} priority={i < 10}/>)}
      </div>

      {isLoading && products.length > 0 &&
        <div className="mt-8">
            <ProductGridSkeleton/>
        </div>
      }

      {hasMore && !isLoading && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMoreProducts} disabled={isLoading} size="lg">
            {isLoading ? 'Loading...' : 'Load More'}
            <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
