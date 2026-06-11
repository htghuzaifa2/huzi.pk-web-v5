
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { useLightbox } from "@/context/lightbox-context";
import type { ImageObject } from "@/lib/types";

interface ProductImageGalleryProps {
  images: ImageObject[];
  productName: string;
  isQuickView?: boolean;
}

const ImageSlot = ({ src, alt, priority = false, fill = false, sizes = "", isQuickView = false }: { src: string, alt: string, priority?: boolean, fill?: boolean, sizes?: string, isQuickView?: boolean }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative w-full h-full", isQuickView ? "pointer-events-none" : "")}>
      {isLoading && <Skeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : 600}
        height={fill ? undefined : 600}
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-contain transition-opacity duration-500 ease-in-out",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default function ProductImageGallery({ images, productName, isQuickView = false }: ProductImageGalleryProps) {
  const [mainApi, setMainApi] = useState<ReturnType<typeof useEmblaCarousel>[1]>();
  const [thumbApi, setThumbApi] = useState<ReturnType<typeof useEmblaCarousel>[1]>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [mainRef, emblaMainApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [thumbRef, emblaThumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const { openLightbox } = useLightbox();

  useEffect(() => setMainApi(emblaMainApi), [emblaMainApi]);
  useEffect(() => setThumbApi(emblaThumbApi), [emblaThumbApi]);

  const onThumbClick = useCallback((index: number) => {
    if (!mainApi) return;
    mainApi.scrollTo(index);
  }, [mainApi]);

  const scrollPrev = useCallback(() => mainApi?.scrollPrev(), [mainApi]);
  const scrollNext = useCallback(() => mainApi?.scrollNext(), [mainApi]);

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const newSelectedIndex = mainApi.selectedScrollSnap();
    setSelectedIndex(newSelectedIndex);
    thumbApi.scrollTo(newSelectedIndex);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.stopPropagation();
        scrollNext();
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        scrollPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      mainApi.off("select", onSelect);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mainApi, onSelect, scrollNext, scrollPrev]);

  const handleOpenLightbox = (index: number) => {
    if (isQuickView) return;
    const imageUrls = images.map(img => img.url);
    openLightbox(imageUrls, index, productName);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full overflow-hidden rounded-lg group aspect-[4/3] md:aspect-square bg-muted/30">
        <div className="overflow-hidden h-full" ref={mainRef}>
          <div className="flex h-full">
            {images.map((img, index) => (
              <div
                className={cn(
                  "relative w-full flex-shrink-0 flex-grow-0 basis-full h-full",
                  !isQuickView && "cursor-pointer"
                )}
                key={index}
                onClick={() => handleOpenLightbox(index)}
              >
                <ImageSlot
                  src={img.url}
                  alt={img.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 767px) 90vw, 45vw"
                  isQuickView={isQuickView}
                />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <>
            <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground bg-background/50 hover:bg-background/80" onClick={scrollPrev}><ChevronLeft size={24} /></Button>
            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground bg-background/50 hover:bg-background/80" onClick={scrollNext}><ChevronRight size={24} /></Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative w-full">
          <div className="overflow-hidden" ref={thumbRef}>
            <div className="flex gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => onThumbClick(index)}
                  className={cn(
                    "relative aspect-square shrink-0 basis-1/3 sm:basis-1/4 md:basis-1/5 overflow-hidden rounded-md transition-opacity duration-200",
                    selectedIndex === index ? "opacity-100 ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <ImageSlot
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="15vw"
                    isQuickView={isQuickView}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
