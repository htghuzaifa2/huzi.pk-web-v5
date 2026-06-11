
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/product-card';

const HomeClient = dynamic(() => import('./home-client'), {
  ssr: false,
  loading: () => <HomePageSkeleton />,
});

function HomePageSkeleton() {
  return (
    <div>
        <section className="w-full py-20 md:py-24 lg:py-32 bg-muted/50">
            <div className="container mx-auto px-4 text-center">
                <Skeleton className="h-12 sm:h-16 md:h-20 lg:h-24 w-3/4 mx-auto" />
                <Skeleton className="h-6 md:h-7 w-full max-w-2xl mx-auto mt-6" />
                <div className="mt-8 flex justify-center gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-40" />
                </div>
            </div>
        </section>

        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-72 mx-auto" />
                    <Skeleton className="h-6 w-96 mt-4 mx-auto" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <ProductCard key={`skeleton-featured-${i}`} product={null} />
                    ))}
                </div>
            </div>
        </section>
    </div>
  );
}

export default function HomeLoader() {
    return <HomeClient />;
}
