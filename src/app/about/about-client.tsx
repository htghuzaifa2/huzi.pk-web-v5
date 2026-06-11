
"use client";

import { Gem, ShieldCheck, Sparkles, Target, HeartHandshake } from "lucide-react";

const principles = [
    {
        name: "Uncompromising Quality",
        description: "From the fabric in our apparel to the seamless delivery of our digital downloads, we obsess over the details so you don’t have to.",
        icon: <Gem className="h-10 w-10 text-primary" />
    },
    {
        name: "Radical Transparency",
        description: "No surprises, no hidden fees. Just honest descriptions, fair pricing, and products you can trust. What you see is what you get.",
        icon: <ShieldCheck className="h-10 w-10 text-primary" />
    },
    {
        name: "Customer-First Innovation",
        description: "You are our roadmap. Your feedback is our greatest inspiration, driving us to improve and innovate every single day.",
        icon: <Sparkles className="h-10 w-10 text-primary" />
    }
];

export default function AboutClient() {
    return (
        <div className="bg-background text-foreground content-fade-in">
            {/* Hero Section */}
            <header className="relative flex items-center justify-center h-[60vh] md:h-[70vh] bg-gradient-to-br from-primary/10 via-background to-background">
                <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-black/[0.05] [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]"></div>
                <div className="container mx-auto px-4 text-center z-10">
                    <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">Our Story</h1>
                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        Discover the values that drive us to redefine quality, style, and digital innovation in Pakistan.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24 space-y-24">
                
                {/* Our Origin Story */}
                <section className="max-w-4xl mx-auto text-center">
                    <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-muted-foreground">
                         <p className="lead text-xl md:text-2xl !text-foreground">
                            Every movement begins with a question. Ours began in 2024 with one that mattered:
                        </p>
                        <blockquote className="text-2xl md:text-4xl font-semibold text-foreground border-l-4 border-primary pl-6 my-10 italic text-left max-w-3xl mx-auto">
                            “Why should quality, style, and digital innovation feel like a luxury in Pakistan?”
                        </blockquote>
                        <p>
                            We saw a gap in the local market. Global trends were accelerating, yet shoppers in Pakistan often had to compromise—on quality, price, or trust. We believed there was a better way.
                        </p>
                        <p>
                            That’s where Huzi.pk was born: not just as a store, but as a solution. We set out to create a trusted destination where you can confidently shop for modern fashion and essential digital products—without compromise. Our goal is to deliver more than just products. <span className="font-semibold text-primary">We deliver experiences.</span>
                        </p>
                    </div>
                </section>
                
                {/* What We Offer */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="font-headline text-4xl font-bold text-foreground">What We Offer</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Our collections are thoughtfully curated to add value to your modern lifestyle. We don’t sell everything; we sell the right things.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-card p-8 rounded-xl shadow-lg border border-border/50 transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2">
                            <h3 className="font-headline text-2xl font-semibold text-foreground mb-3">Curated Fashion</h3>
                            <p className="text-muted-foreground">
                                Timeless yet modern apparel and accessories that balance style, durability, and fair pricing. Built for your life, designed to last.
                            </p>
                        </div>
                        <div className="bg-card p-8 rounded-xl shadow-lg border border-border/50 transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2">
                            <h3 className="font-headline text-2xl font-semibold text-foreground mb-3">Digital Essentials</h3>
                            <p className="text-muted-foreground">
                                A growing suite of tools and services designed to streamline your work, fuel your creativity, and simplify your digital world.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Core Principles */}
                <section>
                     <div className="text-center mb-12">
                        <h2 className="font-headline text-4xl font-bold text-foreground">Our Core Principles</h2>
                         <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Our brand is built on a foundation of unwavering principles. This is what we stand for.
                        </p>
                    </div>
                     <div className="grid md:grid-cols-3 gap-8">
                        {principles.map((principle) => (
                            <div key={principle.name} className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg border border-border/50 transition-all duration-300 hover:shadow-primary/20 hover-translate-y-2">
                                <div className="mb-4">{principle.icon}</div>
                                <h3 className="font-headline text-2xl font-semibold text-foreground mb-2">{principle.name}</h3>
                                <p className="text-muted-foreground">{principle.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Vision & Promise */}
                <section className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center">
                        <Target className="h-12 w-12 mx-auto text-primary mb-4" />
                        <h2 className="font-headline text-4xl font-bold text-foreground">Our Vision for the Future</h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-muted-foreground mt-4">
                             <p>
                                This is just the beginning. We envision Huzi.pk becoming a household name known for trust, quality, and forward-thinking commerce in Pakistan and beyond. Our dream is not only to be a store you rely on, but a brand you’re proud to be part of. We are building more than a platform—we are creating an ecosystem that evolves with you, where every visit offers fresh styles, useful tools, and new opportunities.
                             </p>
                        </div>
                    </div>
                     <div className="text-center">
                        <HeartHandshake className="h-12 w-12 mx-auto text-primary mb-4" />
                        <h2 className="font-headline text-4xl font-bold text-foreground">Our Promise to You</h2>
                         <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-muted-foreground mt-4">
                             <p>
                                You are at the heart of everything we do. We promise to consistently deliver products that live up to their name, keep our prices fair, and provide reliable service from click to delivery. When you choose Huzi.pk, you’re not just making a purchase—you’re joining a community built on trust, style, and progress.
                             </p>
                         </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center border-t border-border/50 pt-16">
                     <h3 className="font-headline text-3xl md:text-4xl font-bold text-foreground max-w-3xl mx-auto">
                        Join Us on Our Journey
                     </h3>
                     <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Together, we’re shaping the future of online shopping in Pakistan. Welcome to huzi.pk. Your journey to a more stylish and empowered life starts here.
                     </p>
                </footer>
            </main>
        </div>
    );
}
