
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { Product, ImageObject } from "@/lib/types";
import ProductImageGallery from "@/components/product-image-gallery";
import { Badge } from "@/components/ui/badge";
import ProductInfoAccordion from "@/app/product/[slug]/product-info-tabs";
import { ScrollArea } from "./ui/scroll-area";

interface ProductQuickViewProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  useEffect(() => {
    const appRoot = document.querySelector('body > div:first-child') as HTMLElement | null;
    if (appRoot) {
      if (open) {
        appRoot.setAttribute('inert', 'true');
        appRoot.style.pointerEvents = 'none';
        document.body.style.overflow = 'hidden';
      } else {
        appRoot.removeAttribute('inert');
        appRoot.style.pointerEvents = '';
        document.body.style.overflow = '';
      }
    }

    return () => {
      if (appRoot) {
        appRoot.removeAttribute('inert');
        appRoot.style.pointerEvents = '';
        document.body.style.overflow = '';
      }
    };
  }, [open]);
  
  if (!product) return null;
  
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
    onOpenChange(false); // Close dialog on add to cart
  };

  const images: ImageObject[] = [product.image, ...product.additionalImages];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl w-[95vw] sm:w-full h-[90vh] p-0 flex flex-col"
        style={{ touchAction: 'none' }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 pb-0 md:p-6 md:pb-0">
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full w-full">
            <div className="grid md:grid-cols-2 gap-4 p-4 md:p-0">
            <div className="md:col-span-1 p-0 md:p-4">
                <ProductImageGallery images={images} productName={product.name} isQuickView={true} />
            </div>
            <div className="flex flex-col justify-start md:col-span-1 p-2 md:p-6">
                <h1 className="font-headline text-2xl md:text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-baseline gap-3">
                        <p className="font-headline text-3xl font-bold text-price">{`PKR ${Math.round(product.price)}`}</p>
                    </div>
                </div>
                <div className="mt-2">
                    <Badge variant={isOutOfStock ? "destructive" : "default"}>
                        {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </Badge>
                </div>
                <p className="mt-4 text-muted-foreground text-sm">{product.description}</p>
                
                <div className="mt-6 flex flex-col gap-3">
                    <Button 
                        size="lg" 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                    >
                        Add to Cart
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href={`/product/${product.slug}`} onClick={() => onOpenChange(false)}>
                            View Full Details
                        </Link>
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">ID : {product.id}</p>

                <div className="mt-8">
                     <ProductInfoAccordion
                        description={product.longDescription} 
                        specifications={product.specifications} 
                    />
                </div>
            </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
