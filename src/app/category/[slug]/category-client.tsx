
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Category } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProductGridLoader } from "@/components/product-grid-loader";
import { useRouter, useSearchParams } from "next/navigation";
import categoriesData from "@/data/categories.json";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/product-card";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

interface CategoryClientProps {
  slug: string;
}

type SortOrder = "newest" | "oldest" | "price-asc" | "price-desc";

const getCategoryData = (slug: string): Category | null => {
  return categoriesData.categories.find((c) => c.slug === slug) || null;
};

export default function CategoryClient({ slug }: CategoryClientProps) {
  useScrollRestoration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topOfProductsRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchedCategory = getCategoryData(slug);

    if (!fetchedCategory) {
      setError(true);
      console.error("Category not found");
      setIsLoading(false);
      return;
    }

    setCategory(fetchedCategory);
    setIsLoading(false);

  }, [slug]);

  const sortParam = searchParams.get('sort') || 'newest';

  const sortOrder = useMemo<SortOrder>(() => {
    const validSortOrders: SortOrder[] = ["newest", "oldest", "price-asc", "price-desc"];
    return validSortOrders.includes(sortParam as SortOrder) ? sortParam as SortOrder : "newest";
  }, [sortParam]);

  const handleSortChange = (value: SortOrder) => {
    if (!category) return;
    const newUrl = `/category/${category.slug}${value !== 'newest' ? `?sort=${value}` : ''}`;
    router.push(newUrl);
    if (topOfProductsRef.current) {
      topOfProductsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Category Not Found</h1>
        <p className="text-muted-foreground mt-2">The category you're looking for does not exist.</p>
      </div>
    );
  }

  if (isLoading || !category) {
    // Should be handled by the loader, but as a fallback.
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 content-fade-in">
      <h1 className="mb-2 text-center font-headline text-4xl font-bold">
        {category.name}
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        {`Browse our collection of ${category.name.toLowerCase()}.`}
      </p>

      <div ref={topOfProductsRef} className="scroll-mt-20" />

      <div className="flex justify-end mb-8">
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-by" className="text-sm font-medium">Sort by</Label>
          <Select onValueChange={(value: SortOrder) => handleSortChange(value)} value={sortOrder}>
            <SelectTrigger id="sort-by" className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Latest (New to Old)</SelectItem>
              <SelectItem value="oldest">Oldest (Old to New)</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ProductGridLoader key={`${slug}-${sortOrder}`} category={slug} sortBy={sortOrder} />
    </div>
  );
}
