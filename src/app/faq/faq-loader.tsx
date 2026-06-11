
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const FaqClient = dynamic(() => import('./faq-client'), {
  ssr: false,
  loading: () => <FaqPageSkeleton />,
});

function FaqPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <Skeleton className="h-10 w-96 mx-auto mb-4" />
                <Skeleton className="h-6 w-[500px] mx-auto mb-12" />
                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FaqLoader() {
    return <FaqClient />;
}
