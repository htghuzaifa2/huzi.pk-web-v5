
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CashOnDeliveryClient = dynamic(() => import('./cash-on-delivery-client'), {
  ssr: false,
  loading: () => <CashOnDeliveryPageSkeleton />,
});

function CashOnDeliveryPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <Skeleton className="h-10 w-80 mx-auto mb-4" />
                <Skeleton className="h-6 w-[600px] mx-auto mb-12" />
                <div className="space-y-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function CashOnDeliveryLoader() {
    return <CashOnDeliveryClient />;
}
