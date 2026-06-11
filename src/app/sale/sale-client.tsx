'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ShieldAlert, TrendingDown, HeartHandshake } from 'lucide-react';

const principles = [
    {
        name: "Dynamic Price Drops",
        description: "Prices aren't static. In our flash events, algorithms drive values down in real-time. What you see now might be lower in an hour—or gone.",
        icon: <TrendingDown className="h-10 w-10 text-yellow-500" />
    },
    {
        name: "First-Come Advantage",
        description: "Stock is intentionally limited to maintain exclusivity. Our flash sales reward the quickest decision-makers with the steepest discounts.",
        icon: <Zap className="h-10 w-10 text-yellow-500" />
    },
    {
        name: "Authentic Inventory",
        description: "Every item in our flash sale is verified for quality. Low price never means low quality. We stand by every product we drop.",
        icon: <ShieldAlert className="h-10 w-10 text-yellow-500" />
    }
];

export default function SaleClient() {
    return (
        <div className="bg-background text-foreground content-fade-in">
            {/* Marquee Banner */}
            <div className="bg-yellow-400 text-black overflow-hidden py-3 whitespace-nowrap sticky top-0 z-50 shadow-[0_0_20px_rgba(234,179,8,0.5)] border-b-4 border-black">
                <div className="animate-marquee inline-block font-black tracking-widest text-sm sm:text-base uppercase">
                    ⚠️ FLASH SALE LIVE &nbsp;•&nbsp; UNSTABLE PRICES &nbsp;•&nbsp; INSTANT SAVINGS &nbsp;•&nbsp; 50% OFF SELECT ITEMS &nbsp;•&nbsp; LIMITED TIME ONLY &nbsp;•&nbsp; ⚠️ FLASH SALE LIVE &nbsp;•&nbsp; UNSTABLE PRICES &nbsp;•&nbsp; INSTANT SAVINGS &nbsp;•&nbsp; 50% OFF SELECT ITEMS &nbsp;•&nbsp; LIMITED TIME ONLY &nbsp;•&nbsp;
                </div>
            </div>

            {/* Hero Section */}
            <header className="relative flex items-center justify-center h-[60vh] md:h-[70vh] bg-gradient-to-br from-yellow-500/10 via-background to-background">
                <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-black/[0.05] [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]"></div>
                <div className="container mx-auto px-4 text-center z-10">
                    <div className="inline-flex items-center gap-2 mb-8 px-6 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 backdrop-blur-md">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold tracking-wider text-xs sm:text-sm uppercase">Sale Engine Active</span>
                    </div>
                    <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tight mb-6">The Flash Experience</h1>
                    <p className="mt-6 text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
                        Redefining the rush of the hunt. <br />
                        <span className="text-yellow-600 dark:text-yellow-500 font-semibold italic">High stakes. Higher rewards.</span>
                    </p>
                    <div className="mt-12">
                        <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 font-black text-xl h-16 px-16 rounded-full shadow-[0_0_50px_-10px_rgba(234,179,8,0.5)] transition-all hover:scale-110" asChild>
                            <Link href="/all-products">SHOP NOW</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24 space-y-32">

                {/* Manifesto Section */}
                <section className="max-w-4xl mx-auto text-center">
                    <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-muted-foreground">
                        <p className="text-yellow-600 dark:text-yellow-400 font-bold tracking-[0.2em] uppercase text-sm mb-4">Our Philosophy</p>
                        <h2 className="font-headline text-4xl md:text-6xl font-black text-foreground mb-12">Why We Flash Sale</h2>
                        <p className="lead text-xl md:text-2xl !text-foreground">
                            We believe that premium style shouldn't always come with a premium price tag.
                        </p>
                        <blockquote className="text-2xl md:text-4xl font-semibold text-foreground border-l-4 border-yellow-500 pl-6 my-10 italic text-left max-w-3xl mx-auto">
                            “The best deals don't wait for permission. They happen in a flash.”
                        </blockquote>
                        <p>
                            By fluctuating our prices and rotating our featured collections, we keep the experience fresh, exciting, and accessible. It's not just a discount; it's a moment for our community to engage with quality in a dynamic way.
                        </p>
                    </div>
                </section>

                {/* Principles Grid */}
                <section>
                    <div className="text-center mb-16">
                        <h2 className="font-headline text-4xl font-bold text-foreground uppercase tracking-tight">Our Sale Principles</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            The engine behind the hunt. Here is how we ensure fairness and excitement in every drop.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {principles.map((principle) => (
                            <div key={principle.name} className="flex flex-col items-center text-center p-10 bg-card rounded-2xl shadow-lg border border-border/50 transition-all duration-300 hover:shadow-yellow-500/20 hover:-translate-y-2">
                                <div className="mb-6 p-4 bg-yellow-500/10 rounded-2xl">{principle.icon}</div>
                                <h3 className="font-headline text-2xl font-bold text-foreground mb-3">{principle.name}</h3>
                                <p className="text-muted-foreground leading-relaxed">{principle.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center space-y-12 max-w-4xl mx-auto border-t border-border/50 pt-24">
                    <HeartHandshake className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                    <h2 className="font-headline text-4xl md:text-6xl font-black text-foreground">Ready to hunt?</h2>
                    <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-light">
                        Our collection is waiting. Every click could be the one that saves you 50% or more. Timing is everything.
                    </p>
                    <div className="flex justify-center">
                        <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 font-black text-xl h-16 px-16 rounded-full shadow-[0_0_50px_-10px_rgba(234,179,8,0.5)] transition-all hover:scale-110" asChild>
                            <Link href="/all-products">SHOP NOW</Link>
                        </Button>
                    </div>
                </section>

                {/* Footer Section */}
                <footer className="text-center pt-16">
                    <p className="text-muted-foreground text-sm tracking-widest uppercase">
                        © 2026 HUZI.PK | REVOLUTIONIZING QUALITY
                    </p>
                </footer>
            </main>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
}
