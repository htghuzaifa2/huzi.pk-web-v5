
"use client";

import CategoryCard from "@/components/category-card";
import categoriesData from "@/data/categories.json";
import type { Category } from "@/lib/types";

export default function CategoriesClient() {
  const categories: Category[] = categoriesData.categories;

  return (
    <div className="container mx-auto px-4 py-12 content-fade-in">
      <h1 className="mb-8 text-center font-headline text-4xl font-bold">
        All Categories
      </h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
