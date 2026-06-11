"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { Product, ImageObject } from "@/lib/types";
import ProductImageGallery from "@/components/product-image-gallery";
import { Badge } from "@/components/ui/badge";
import ProductInfoAccordion from "./product-info-tabs";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/product-card";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import { useProductsData } from "@/hooks/use-products-data";

interface ProductDetailsClientProps {
  slug: string;
}

export default function ProductDetailsClient({ slug }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { products: allProducts, isLoading: isDataLoading } = useProductsData();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDataLoading || allProducts.length === 0) return;

    const foundProduct = allProducts.find((p) => p.slug === slug) || null;

    if (!foundProduct) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    setProduct(foundProduct);

    // Get related products (same category, excluding current)
    const sameCategoryProducts = allProducts.filter(p =>
      p.id !== foundProduct.id &&
      p.category.some(cat => foundProduct.category.includes(cat))
    );

    // Shuffle and pick 10
    const shuffled = sameCategoryProducts.sort(() => 0.5 - Math.random());
    let related = shuffled.slice(0, 10);

    // Fill with random if needed
    if (related.length < 10) {
      const needed = 10 - related.length;
      const currentIds = new Set(related.map(p => p.id).concat(foundProduct.id));
      const randomProducts = allProducts
        .filter(p => !currentIds.has(p.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, needed);
      related = [...related, ...randomProducts];
    }

    setRelatedProducts(related);
    setIsLoading(false);
  }, [slug, allProducts, isDataLoading]);

  if (isLoading || isDataLoading) {
    return null;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground mt-2">The product you're looking for does not exist.</p>
      </div>
    );
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const images: ImageObject[] = [product.image, ...product.additionalImages];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 content-fade-in">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-6 md:gap-8 lg:gap-12">
        <div className="md:col-span-1">
          <ProductImageGallery images={images} productName={product.name} />
        </div>
        <div className="flex flex-col justify-start md:col-span-1">
          <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-baseline gap-3">
              <p className="font-headline text-4xl font-bold text-price">{`PKR ${Math.round(product.price)}`}</p>
            </div>
          </div>
          <div className="mt-2">
            <Badge variant={isOutOfStock ? "destructive" : "default"}>
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </Badge>
          </div>
          <p className="mt-4 text-muted-foreground">{product.description}</p>
          <div className="mt-6">
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              Add to Cart
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">ID : {product.id}</p>
        </div>
      </div>
      <div className="my-8 md:my-12">
        <Separator />
        <div className="mt-8 md:mt-12 max-w-4xl mx-auto">
          <ProductInfoAccordion
            description={product.longDescription}
            specifications={product.specifications}
          />
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <div className="mt-16 md:mt-24">
          <Separator className="mb-12" />
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {relatedProducts.map((relatedProduct, index) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} priority={index < 5} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
