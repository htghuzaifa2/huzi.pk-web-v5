// public/prefetch.js
(function () {
    // 1. Safety Checks: Exit if data-saver is on or connection is 2G
    if (
        typeof window === 'undefined' ||
        !window.requestIdleCallback ||
        navigator.connection?.saveData ||
        navigator.connection?.effectiveType?.includes('2g')
    ) return;

    const prefetched = new Set();
    const preconnected = new Set();
    const queue = [];
    let active = 0;
    // Limit simultaneous requests based on connection speed
    const limit = navigator.connection?.effectiveType === '3g' ? 2 : 6;

    function processQueue() {
        if (active >= limit || queue.length === 0) return;
        const url = queue.shift();
        active++;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.onload = link.onerror = () => {
            active--;
            processQueue();
        };
        document.head.appendChild(link);
    }

    function prefetch(url, priority = false) {
        try {
            const target = new URL(url);
            // Skip internal links, duplicate links, or heavy file types
            if (
                target.origin === location.origin ||
                prefetched.has(url) ||
                /\.(zip|pdf|exe|dmg|mp4|png|jpg|jpeg)$/i.test(url)
            ) return;

            // DNS/TLS Preconnect: Warms up the "pipe" to the external server
            if (!preconnected.has(target.origin)) {
                const conn = document.createElement('link');
                conn.rel = 'preconnect';
                conn.href = target.origin;
                document.head.appendChild(conn);
                preconnected.add(target.origin);
            }

            prefetched.add(url);
            priority ? queue.unshift(url) : queue.push(url);
            requestIdleCallback(processQueue);
        } catch (e) { /* Catch malformed URLs */ }
    }

    // Viewport Observer: Prefetch links 50% screen-width away
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                prefetch(entry.target.href);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '50%' });

    function scan() {
        document.querySelectorAll('a[href^="http"]').forEach((a) => {
            if (prefetched.has(a.href) || a.href.startsWith(location.origin)) return;

            observer.observe(a);
            // Desktop: Hover priority | Mobile: Touch priority
            a.addEventListener('mouseenter', () => prefetch(a.href, true), { once: true });
            a.addEventListener('touchstart', () => prefetch(a.href, true), { once: true, passive: true });
        });
    }

    // Support for SPAs and Dynamic Content
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    requestIdleCallback(scan);

    window.__prefetchStats = { total: () => prefetched.size, active: () => active };
})();
