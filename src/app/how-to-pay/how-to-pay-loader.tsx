
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HowToPayClient = dynamic(() => import('./how-to-pay-client'), {
  ssr: false,
  loading: () => <HowToPayPageSkeleton />,
});

function HowToPayPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <Skeleton className="h-10 w-80 mx-auto mb-4" />
                <Skeleton className="h-6 w-[600px] mx-auto mb-12" />
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <Skeleton className="h-32 w-full mb-12" />
                <div className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-6 w-96 mx-auto mt-2" />
                </div>
            </div>
        </div>
    );
}

export default function HowToPayLoader() {
    return <HowToPayClient />;
}
