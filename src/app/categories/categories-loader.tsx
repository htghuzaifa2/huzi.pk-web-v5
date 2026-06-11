
"use client";

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CategoriesClient = dynamic(() => import('./categories-client'), {
  ssr: false,
  loading: () => <CategoriesPageSkeleton />,
});

function CategoriesPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-10 w-1/2 mx-auto mb-8" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/2] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function CategoriesLoader() {
  return <CategoriesClient />;
}
