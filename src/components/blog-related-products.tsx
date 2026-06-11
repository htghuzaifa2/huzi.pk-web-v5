"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import { useProductsData } from "@/hooks/use-products-data";
import type { Product } from "@/lib/types";

export default function BlogRelatedProducts() {
    const { products: allProducts, isLoading } = useProductsData();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (isLoading || allProducts.length === 0) return;
        // Shuffle and pick 10 random products
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        const randomProducts = shuffled.slice(0, 10);
        setProducts(randomProducts);
    }, [allProducts, isLoading]);

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 md:mt-24">
            <Separator className="mb-12" />
            <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-8">
                You Might Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 5} />
                ))}
            </div>
        </div>
    );
}
