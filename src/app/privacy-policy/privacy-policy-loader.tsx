"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PrivacyPolicyClient = dynamic(() => import('./privacy-policy-client'), {
    ssr: false,
    loading: () => <PrivacyPolicySkeleton />,
});

function PrivacyPolicySkeleton() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 space-y-8">
            <div className="max-w-4xl mx-auto text-center">
                <Skeleton className="h-12 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 border rounded-xl space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PrivacyPolicyLoader() {
    return <PrivacyPolicyClient />;
}
