
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AboutClient = dynamic(() => import('./about-client'), {
  ssr: false,
  loading: () => <AboutPageSkeleton />,
});

function AboutPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 space-y-24">
            <header className="relative flex items-center justify-center h-[60vh] md:h-[70vh]">
                <div className="text-center z-10">
                    <Skeleton className="h-16 w-96 mx-auto" />
                    <Skeleton className="h-8 w-[500px] mt-6 mx-auto" />
                </div>
            </header>
            <section className="max-w-4xl mx-auto text-center space-y-6">
                <Skeleton className="h-8 w-80 mx-auto" />
                <Skeleton className="h-12 w-[600px] mx-auto" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6 mx-auto" />
            </section>
            <section>
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-6 w-96 mt-4 mx-auto" />
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
            </section>
             <section>
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-72 mx-auto" />
                    <Skeleton className="h-6 w-96 mt-4 mx-auto" />
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </section>
        </div>
    );
}

export default function AboutLoader() {
    return <AboutClient />;
}
