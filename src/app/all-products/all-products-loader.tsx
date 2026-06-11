
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/product-card';

const AllProductsClient = dynamic(() => import('./all-products-client'), {
  ssr: false,
  loading: () => <AllProductsSkeleton />,
});

function AllProductsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
      <Skeleton className="h-6 w-3/4 mx-auto mb-8" />
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-10 w-24" />)}
        </div>
      </div>
      <div className="flex justify-end mb-8">
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <ProductCard key={`skeleton-${index}`} product={null} />
        ))}
      </div>
    </div>
  );
}

export default function AllProductsLoader() {
    return <AllProductsClient />;
}

    