import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">

            {/* Animated Icon Container */}
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse group-hover:bg-primary/30 transition-colors duration-500" />
                <div className="relative z-10 animate-bounce duration-[3000ms]">
                    <img
                        src="/funny-404.png"
                        alt="Funny 404 Robot"
                        className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
                    />
                </div>
            </div>

            <div className="space-y-4 max-w-[600px] mx-auto z-10">
                <h1 className="text-8xl md:text-9xl font-black animate-rgb-text select-none">
                    404
                </h1>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Page not found
                </h2>
                <p className="text-muted-foreground text-lg">
                    Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-forwards">
                <Button asChild size="lg" className="group shadow-lg hover:shadow-xl transition-all duration-300">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        Back to Home
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="group hover:bg-secondary/50">
                    <Link href="/contact">
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Contact Support
                    </Link>
                </Button>
            </div>

            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

        </div>
    )
}
