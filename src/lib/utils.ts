import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
}

export function generateUniqueSlug(productName: string, allProducts: Product[]): string {
    const baseSlug = slugify(productName);
    let finalSlug = baseSlug;
    let counter = 2;

    const existingSlugs = allProducts.map(p => p.slug).filter(Boolean);

    while (existingSlugs.includes(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
    }

    return finalSlug;
}
