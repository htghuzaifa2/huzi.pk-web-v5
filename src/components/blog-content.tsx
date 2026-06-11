"use client";

import { useEffect, useRef, useState } from "react";
import { useLightbox } from "@/context/lightbox-context";
import { useRouter } from "next/navigation";

interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { openLightbox } = useLightbox();
    const router = useRouter();
    const [processedContent, setProcessedContent] = useState(content);

    // Process content: add IDs to headings, convert absolute internal links to relative
    useEffect(() => {
        if (!content) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        // Add IDs to headings
        const headings = doc.querySelectorAll("h2, h3, h4");
        headings.forEach((heading, index) => {
            if (!heading.id) {
                const text = heading.textContent?.trim() || "";
                const slug = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .substring(0, 50);
                heading.id = `heading-${slug}-${index}`;
            }
        });

        // Convert absolute huzi.pk links to relative paths for fast client-side navigation
        const links = doc.querySelectorAll("a");
        links.forEach((link) => {
            const href = link.getAttribute("href");
            if (href) {
                // Convert https://huzi.pk/xxx to /xxx
                if (href.includes("huzi.pk/")) {
                    try {
                        const url = new URL(href);
                        const relativePath = url.pathname;
                        link.setAttribute("href", relativePath);
                        link.setAttribute("data-internal-link", "true");
                    } catch {
                        // Not a valid URL, skip
                    }
                } else if (href.startsWith("/")) {
                    // Already relative
                    link.setAttribute("data-internal-link", "true");
                }
                // Ensure internal links never open in new tab
                if (link.getAttribute("data-internal-link") === "true") {
                    link.removeAttribute("target");
                    link.removeAttribute("rel");
                }
            }
        });

        setProcessedContent(doc.body.innerHTML);
    }, [content]);

    // Handle click interception for client-side navigation on internal links
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a") as HTMLAnchorElement | null;
            if (!anchor) return;

            const isInternal = anchor.getAttribute("data-internal-link") === "true";
            if (isInternal) {
                e.preventDefault();
                const href = anchor.getAttribute("href");
                if (href) {
                    router.push(href);
                }
            }
        };

        container.addEventListener("click", handleClick);

        // Dynamically initialize Mermaid only when mermaid diagrams are present
        const mermaidNodes = container.querySelectorAll('.mermaid');
        if (mermaidNodes.length > 0) {
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
                mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
                mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
            `;
            document.head.appendChild(script);
        }

        // Image lightbox
        const images = container.querySelectorAll("img");
        const imageUrls = Array.from(images).map((img) => img.src);

        const handleImageClick = (index: number) => () => {
            openLightbox(imageUrls, index, "Blog Image");
        };

        images.forEach((img, index) => {
            img.style.cursor = "zoom-in";
            img.addEventListener("click", handleImageClick(index));
        });

        return () => {
            container.removeEventListener("click", handleClick);
            images.forEach((img, index) => {
                img.removeEventListener("click", handleImageClick(index));
            });
        };
    }, [processedContent, openLightbox, router]);

    return (
        <div
            ref={containerRef}
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: processedContent }}
        />
    );
}
