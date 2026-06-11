
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ShippingPolicyClient = dynamic(() => import('./shipping-policy-client'), {
  ssr: false,
  loading: () => <ShippingPolicyPageSkeleton />,
});

function ShippingPolicyPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <Skeleton className="h-10 w-96 mx-auto mb-8" />
                <div className="space-y-6">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-8 w-1/2 mt-8 mb-4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-8 w-1/2 mt-8 mb-4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-8 w-1/2 mt-8 mb-4" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function ShippingPolicyLoader() {
    return <ShippingPolicyClient />;
}
