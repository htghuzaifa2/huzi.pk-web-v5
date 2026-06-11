"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronRight, Menu, X } from "lucide-react";

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    contentSelector?: string;
}

export default function TableOfContents({ contentSelector = ".blog-content" }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    // Extract headings from the DOM
    useEffect(() => {
        const contentElement = document.querySelector(contentSelector);
        if (!contentElement) return;

        const headingElements = contentElement.querySelectorAll("h2, h3");
        const items: TOCItem[] = [];

        headingElements.forEach((heading, index) => {
            const text = heading.textContent?.trim() || "";
            if (!text) return;

            // Generate ID if not present
            let id = heading.id;
            if (!id) {
                id = `heading-${index}`;
                heading.id = id;
            }

            items.push({
                id,
                text,
                level: heading.tagName === "H2" ? 2 : 3,
            });
        });

        setHeadings(items);
    }, [contentSelector]);

    // Intersection Observer for active heading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0% -35% 0%",
                threshold: 0,
            }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    // Scroll to heading
    const scrollToHeading = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });

            setActiveId(id);
            setIsOpen(false);
        }
    }, []);

    // Truncate text for display
    const truncateText = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    if (headings.length === 0) return null;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 right-6 z-50 lg:hidden flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                aria-label="Toggle Table of Contents"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Table of Contents */}
            <nav
                className={`
                    fixed lg:sticky top-24 z-40 lg:z-auto
                    right-0 lg:right-auto
                    h-screen lg:h-auto
                    w-80 max-w-[85vw] lg:w-72 xl:w-80
                    bg-background/95 lg:bg-transparent
                    backdrop-blur-lg lg:backdrop-blur-none
                    border-l lg:border-0 border-border
                    shadow-2xl lg:shadow-none
                    p-6 lg:p-0
                    overflow-y-auto
                    transition-transform duration-300 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="lg:sticky lg:top-24">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                        <div className="w-1 h-6 bg-primary rounded-full" />
                        <h2 className="text-lg font-bold text-foreground">
                            On This Page
                        </h2>
                    </div>

                    {/* Heading List */}
                    <ul className="space-y-1">
                        {headings.map((heading, index) => (
                            <li
                                key={heading.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <button
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={`
                                        group relative
                                        w-full text-left
                                        px-3 py-2.5
                                        rounded-lg
                                        transition-all duration-300 ease-out
                                        flex items-start gap-2
                                        ${heading.level === 3 ? "pl-6" : ""}
                                        ${
                                            activeId === heading.id
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }
                                    `}
                                >
                                    {/* Active Indicator Bar */}
                                    <span
                                        className={`
                                            absolute left-0 top-1/2 -translate-y-1/2
                                            w-1 h-0 rounded-full
                                            bg-primary
                                            transition-all duration-300 ease-out
                                            ${activeId === heading.id ? "h-6" : "group-hover:h-3"}
                                        `}
                                    />

                                    {/* Chevron Icon */}
                                    <ChevronRight
                                        className={`
                                            w-4 h-4 mt-0.5 flex-shrink-0
                                            transition-all duration-300
                                            ${activeId === heading.id ? "text-primary rotate-90" : "text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1"}
                                        `}
                                    />

                                    {/* Text */}
                                    <span className="text-sm leading-snug">
                                        {truncateText(heading.text, 45)}
                                    </span>

                                    {/* Hover Background Effect */}
                                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Progress Indicator */}
                    <div className="mt-6 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>Reading Progress</span>
                            <span>{headings.findIndex(h => h.id === activeId) + 1} / {headings.length}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
