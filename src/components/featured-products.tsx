
"use client";

import React, { useRef, useEffect, useState } from 'react';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { useWindowedProducts } from '@/hooks/use-windowed-products';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { ArrowDown, ArrowUp } from 'lucide-react';

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <ProductCard key={`skeleton-${i}`} product={null} />
      ))}
    </div>
  );
}

export default function FeaturedProducts() {
  const {
    products,
    isLoading,
    loadMore,
    loadPrevious,
    canLoadMore,
    canLoadPrevious,
    gridRef,
    isLoadPreviousVisible,
    setIsLoadPreviousVisible,
    isRestoring,
  } = useWindowedProducts();

  const loadPreviousBarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsLoadPreviousVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setIsLoadPreviousVisible(false);
    }, 5000);
  };

  useEffect(() => {
    if (canLoadPrevious) {
      handleMouseLeave(); // Start timer on initial show
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [canLoadPrevious]);

  if (isRestoring) {
     return (
       <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
           <div className="text-center mb-12">
                <h2 className="font-headline text-4xl font-bold">Featured Products</h2>
                <p className="mt-4 text-lg text-muted-foreground">Hand-picked just for you.</p>
            </div>
            <div
              id="featured-grid-container"
              className="relative"
            >
              <div ref={gridRef} id="featured-grid" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                 {products.map((p) => (
                  <ProductCard key={p.id} product={p} priority={true} />
                ))}
              </div>
            </div>
        </div>
      </section>
     )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div
          ref={loadPreviousBarRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'sticky top-20 z-40 flex justify-center py-2 transition-all duration-300',
            canLoadPrevious && isLoadPreviousVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          )}
        >
          <Button onClick={loadPrevious} variant="secondary" className="shadow-lg">
             <ArrowUp className="mr-2" />
            Load Previous 25
          </Button>
        </div>

        <div className="text-center mb-12">
            <h2 className="font-headline text-4xl font-bold">Featured Products</h2>
            <p className="mt-4 text-lg text-muted-foreground">A selection of our finest items, just for you.</p>
        </div>

        {isLoading && products.length === 0 ? (
          <ProductGridSkeleton />
        ) : (
          <div
            id="featured-grid-container"
            className="relative"
          >
            <div ref={gridRef} id="featured-grid" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 10} />
              ))}
            </div>

            {isLoading && products.length > 0 && 
              <div className="mt-8"><ProductGridSkeleton /></div>
            }
          </div>
        )}
        
        {canLoadMore && !isLoading && (
          <div className="mt-12 flex justify-center">
            <Button onClick={loadMore} size="lg">
                <ArrowDown className="mr-2" />
              Load More
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}
