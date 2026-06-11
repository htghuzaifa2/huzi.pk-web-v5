
"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import ProductQuickView from "./product-quick-view";
import { Button } from "./ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product | null;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  if (!product) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-1/2 mx-auto" />
      </div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setQuickViewOpen(true);
  };

  const productSlug = product.slug || '';

  return (
    <>
      <Card
        className="group/card relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1"
        style={{ transform: 'translateZ(0)' }}
      >
        <Link href={`/product/${productSlug}`} className="flex flex-col h-full" prefetch={true}>
          <div className="relative w-full overflow-hidden bg-gradient-to-b from-background to-muted/30 aspect-square">
            {isImageLoading && <Skeleton className="absolute inset-0" />}
            <Image
              src={product.image.url}
              alt={product.image.alt}
              width={300}
              height={300}
              priority={priority}
              className={cn(
                "object-contain transition-transform duration-500 ease-out group-hover/card:scale-110 w-full h-full p-2",
                isImageLoading ? 'opacity-0' : 'opacity-100'
              )}
              style={{ willChange: 'transform' }}
              onLoad={() => setIsImageLoading(false)}
              loading={priority ? 'eager' : 'lazy'}
            />
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          <div className="flex flex-1 flex-col p-4 text-center bg-gradient-to-t from-card via-card to-transparent">
            <h3 className="font-headline text-sm sm:text-base font-semibold leading-tight mb-2 break-words min-h-[2.5rem] flex items-center justify-center line-clamp-2 group-hover/card:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="mt-auto flex items-baseline justify-center gap-2 pt-2">
              <p className="text-lg font-bold text-price tracking-tight">{`PKR ${Math.round(product.price).toLocaleString()}`}</p>
            </div>
          </div>
        </Link>

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-2 group-hover/card:translate-x-0">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={handleQuickView}
            aria-label="Quick View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      <ProductQuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </>
  );
}

