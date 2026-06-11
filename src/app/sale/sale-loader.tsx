
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const SaleClient = dynamic(() => import('./sale-client'), {
    ssr: false,
    loading: () => <SalePageSkeleton />,
});

function SalePageSkeleton() {
    return (
        <div className="min-h-screen bg-[#050505] space-y-24">
            <header className="relative flex items-center justify-center h-[60vh] md:h-[70vh]">
                <div className="container mx-auto px-4 text-center z-10">
                    <Skeleton className="h-20 sm:h-32 md:h-40 w-3/4 mx-auto bg-white/5" />
                    <Skeleton className="h-8 w-2/3 mt-10 mx-auto bg-white/5" />
                    <div className="mt-12 flex justify-center">
                        <Skeleton className="h-16 w-48 rounded-full bg-white/5" />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-16 space-y-40">
                <section className="max-w-4xl mx-auto text-center space-y-12">
                    <Skeleton className="h-6 w-32 mx-auto bg-white/5" />
                    <Skeleton className="h-16 w-2/3 mx-auto bg-white/5" />
                    <Skeleton className="h-40 w-full bg-white/5" />
                </section>
                <div className="grid md:grid-cols-3 gap-12">
                    <Skeleton className="h-64 rounded-3xl bg-white/5" />
                    <Skeleton className="h-64 rounded-3xl bg-white/5" />
                    <Skeleton className="h-64 rounded-3xl bg-white/5" />
                </div>
            </main>
        </div>
    );
}

export default function SaleLoader() {
    return <SaleClient />;
}
