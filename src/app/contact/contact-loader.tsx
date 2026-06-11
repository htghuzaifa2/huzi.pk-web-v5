
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const ContactClient = dynamic(() => import('./contact-client'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-6 w-3/4 mx-auto mb-12" />
            <div className="grid md:grid-cols-2 gap-8 text-center mb-16">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <div className="max-w-2xl mx-auto">
                 <div className="space-y-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    </div>
  ),
});

export default function ContactLoader() {
    return <ContactClient />;
}
