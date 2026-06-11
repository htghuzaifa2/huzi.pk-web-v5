
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/product-card';

// Dynamically import the client component with SSR disabled
const CategoryClient = dynamic(() => import('./category-client'), {
  ssr: false,
  loading: () => <CategoryPageSkeleton />,
});

// Define the skeleton loader component
function CategoryPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
      <Skeleton className="h-6 w-3/4 mx-auto mb-8" />
      <div className="flex justify-end mb-8">
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <ProductCard key={`skeleton-${index}`} product={null} />
        ))}
      </div>
    </div>
  );
}

interface CategoryLoaderProps {
  slug: string;
}

// The loader component that will be rendered on the server
export default function CategoryLoader({ slug }: CategoryLoaderProps) {
    return <CategoryClient slug={slug} />;
}
