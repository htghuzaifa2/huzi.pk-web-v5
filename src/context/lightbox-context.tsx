"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Copy,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from "embla-carousel-react";
import { useToast } from '@/hooks/use-toast';
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchContentRef
} from "react-zoom-pan-pinch";

interface LightboxContextType {
  openLightbox: (images: string[], index: number, productName: string) => void;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined);

export const useLightbox = () => {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
};

interface LightboxState {
  images: string[];
  index: number;
  productName: string;
}

export const LightboxProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<LightboxState>({
    images: [],
    index: 0,
    productName: ''
  });

  const openLightbox = (images: string[], index: number, productName: string) => {
    setData({ images, index, productName });
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return (
    <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}
      {isOpen && <LightboxContent {...data} closeLightbox={closeLightbox} />}
    </LightboxContext.Provider>
  );
};

const ImageSlot = ({
  src,
  alt,
  priority = false,
  fill = false,
  sizes = ""
}: {
  src: string,
  alt: string,
  priority?: boolean,
  fill?: boolean,
  sizes?: string
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isLoading && <Skeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-contain transition-opacity duration-500 ease-in-out",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        loading={priority ? 'eager' : 'lazy'}
        draggable={false} // Important for drag-to-pan
      />
    </div>
  );
};

const LightboxContent = ({
  images,
  index,
  productName,
  closeLightbox
}: LightboxState & { closeLightbox: () => void }) => {
  const [lightboxApi, setLightboxApi] = useState<ReturnType<typeof useEmblaCarousel>[1]>();
  const [isZoomed, setIsZoomed] = useState(false);
  const transformComponentRef = useRef<ReactZoomPanPinchContentRef>(null);

  // Initialize carousel with drag disabled if zoomed
  const [lightboxRef, emblaLightboxApi] = useEmblaCarousel({
    loop: images.length > 1,
    startIndex: index,
    watchDrag: !isZoomed,
  });

  const { toast } = useToast();

  useEffect(() => {
    setLightboxApi(emblaLightboxApi);
  }, [emblaLightboxApi]);

  // Update drag state when zoom changes
  useEffect(() => {
    if (lightboxApi) {
      lightboxApi.reInit({ watchDrag: !isZoomed });
    }
  }, [isZoomed, lightboxApi]);

  const lightboxScrollPrev = useCallback(() => {
    if (!isZoomed) lightboxApi?.scrollPrev();
  }, [lightboxApi, isZoomed]);

  const lightboxScrollNext = useCallback(() => {
    if (!isZoomed) lightboxApi?.scrollNext();
  }, [lightboxApi, isZoomed]);

  const selectedIndex = lightboxApi?.selectedScrollSnap() ?? index;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to work even if zoomed, to reset or close
      if (e.key === "Escape") {
        if (isZoomed) {
          transformComponentRef.current?.resetTransform();
        } else {
          closeLightbox();
        }
      }
      if (!isZoomed) {
        if (e.key === "ArrowRight") lightboxScrollNext();
        if (e.key === "ArrowLeft") lightboxScrollPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeLightbox, lightboxScrollNext, lightboxScrollPrev, isZoomed]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToShare = window.location.href;
    const shareData = {
      title: productName,
      text: `Check out this product: ${productName}`,
      url: urlToShare,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(urlToShare);
        toast({
          title: "Link Copied!",
          description: "The product link has been copied to your clipboard.",
        });
      }
    } catch (err) {
      console.error("Share failed:", err);
      // Fallback
      window.prompt("Copy this link:", urlToShare);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToShare = window.location.href;
    try {
      await navigator.clipboard.writeText(urlToShare);
      toast({
        title: "Link Copied!",
        description: "The product link has been copied to your clipboard.",
      });
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm lightbox-zoom-in"
      onClick={() => {
        // If background clicked, only close if not interaction with image
        // But with zoom library, we might want to be strict.
        // Let's rely on the Close button or Escape.
        // Or check event target.
      }}
      style={{ touchAction: 'none' }}
    >
      <div
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
          {/* Empty left side or add status */}
          <div className="text-white/70 text-sm font-medium bg-black/40 px-3 py-1 rounded-full pointer-events-auto backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <Button size="icon" variant="ghost" className="text-white bg-black/50 hover:bg-black/80 h-10 w-10 backdrop-blur-md" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-white bg-black/50 hover:bg-black/80 h-10 w-10 backdrop-blur-md" onClick={handleCopyLink}>
              <Copy className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-white bg-black/50 hover:bg-black/80 h-10 w-10 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); closeLightbox(); }}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative" ref={lightboxRef}>
          <div className="flex h-full">
            {images.map((imgSrc, i) => (
              <div
                className="relative w-full h-full flex-shrink-0 flex-grow-0 basis-full flex items-center justify-center"
                key={`lightbox-main-${i}`}
              >
                {/* Only render TransformWrapper for the active slide or nearby to save memory/perf? 
                      Actually render for all but re-init logic might handle state.
                      Best to wrap all, but only enable interaction on active?
                  */}
                <TransformWrapper
                  ref={i === selectedIndex ? transformComponentRef : undefined}
                  onZoom={(ref) => setIsZoomed(ref.state.scale > 1)}
                  onTransformed={(ref) => setIsZoomed(ref.state.scale > 1)}
                  initialScale={1}
                  minScale={1}
                  maxScale={4}
                  centerOnInit={true}
                  alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                  disabled={i !== selectedIndex} // Disable zoom on non-active slides (prevents accidental zoom on scroll)
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <React.Fragment>
                      {/* We can put controls here via render prop if we want per-slide controls, but one global is better */}
                      <TransformComponent
                        wrapperStyle={{ width: "100%", height: "100%" }}
                        contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <div className="relative w-full h-[80vh] md:h-[90vh]">
                          <ImageSlot
                            src={imgSrc}
                            alt={productName}
                            fill
                            priority={i === selectedIndex}
                            sizes="100vw"
                          />
                        </div>
                      </TransformComponent>
                    </React.Fragment>
                  )}
                </TransformWrapper>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Zoom Controls Dock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 pointer-events-auto">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              transformComponentRef.current?.zoomOut();
            }}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              transformComponentRef.current?.resetTransform();
            }}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              transformComponentRef.current?.zoomIn();
            }}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Arrows (Hide if zoomed or single image) */}
        {images.length > 1 && !isZoomed && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 bg-black/30 hover:bg-black/60 md:left-4 h-12 w-12 rounded-full backdrop-blur-sm z-40"
              onClick={(e) => { e.stopPropagation(); lightboxScrollPrev(); }}
            >
              <ChevronLeft size={36} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 bg-black/30 hover:bg-black/60 md:right-4 h-12 w-12 rounded-full backdrop-blur-sm z-40"
              onClick={(e) => { e.stopPropagation(); lightboxScrollNext(); }}
            >
              <ChevronRight size={36} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export const Lightbox = () => null;
