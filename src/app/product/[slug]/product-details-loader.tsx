
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetailsClient = dynamic(() => import('./product-details-client'), {
  ssr: false,
  loading: () => <ProductDetailsSkeleton />,
});

function ProductDetailsSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-6">
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-8 lg:gap-12">
            <div className="md:col-span-1">
                <Skeleton className="w-full aspect-square" />
                <div className="flex gap-2 mt-4">
                    <Skeleton className="w-1/4 aspect-square" />
                    <Skeleton className="w-1/4 aspect-square" />
                    <Skeleton className="w-1/4 aspect-square" />
                    <Skeleton className="w-1/4 aspect-square" />
                </div>
            </div>
            <div className="flex flex-col justify-start md:col-span-1 gap-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-12 w-48 mt-4" />
            </div>
            </div>
             <div className="my-8 md:my-12">
                <Skeleton className="h-px w-full" />
                <div className="mt-8 md:mt-12 max-w-4xl mx-auto space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
}

interface ProductDetailsLoaderProps {
    slug: string;
}

export default function ProductDetailsLoader({ slug }: ProductDetailsLoaderProps) {
    return <ProductDetailsClient slug={slug} />;
}
