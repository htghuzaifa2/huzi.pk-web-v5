"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useScrollRestoration() {
    const pathname = usePathname();

    useEffect(() => {
        // Scroll restoration logic
        const saveScrollMap = (pos: number) => {
            if (typeof window !== "undefined") {
                sessionStorage.setItem(`scroll-pos-${pathname}`, pos.toString());
            }
        };

        const getSavedScroll = () => {
            if (typeof window !== "undefined") {
                return parseInt(sessionStorage.getItem(`scroll-pos-${pathname}`) || "0", 10);
            }
            return 0;
        };

        // Restore scroll position on mount
        const restoreScroll = () => {
            const savedPos = getSavedScroll();
            if (savedPos > 0) {
                // Wrapper to ensure layout has time to shift if needed, or browser has processed navigation
                window.scrollTo(0, savedPos);
                // Sometimes React layout shifts, double check after a tick
                requestAnimationFrame(() => {
                    window.scrollTo(0, savedPos);
                });
            }
        };

        restoreScroll();

        // Save scroll position on scroll
        const handleScroll = () => {
            saveScrollMap(window.scrollY);
        };

        // Debounce listener to not spam storage
        let timeoutId: NodeJS.Timeout;
        const debouncedScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScroll, 100);
        };

        window.addEventListener("scroll", debouncedScroll);

        return () => {
            window.removeEventListener("scroll", debouncedScroll);
            clearTimeout(timeoutId);
        };
    }, [pathname]);
}
