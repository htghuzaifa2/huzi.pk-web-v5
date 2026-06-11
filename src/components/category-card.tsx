
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`} className="group block" prefetch={true}>
      <Card className="relative overflow-hidden rounded-lg">
        <div className="aspect-[3/2] w-full">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover/card:scale-110"
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 30vw"
            data-ai-hint={`${category.slug} clothing`}
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h3 className="font-headline text-3xl font-bold text-white text-center shadow-lg">
            {category.name}
          </h3>
        </div>
      </Card>
    </Link>
  );
}
