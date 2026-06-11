import type { Metadata } from 'next';
import CategoryLoader from './category-loader';
import categoriesData from '@/data/categories.json';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categoriesData.categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categoriesData.categories.find(c => c.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found - huzi.pk',
      description: 'The category you are looking for does not exist.',
    };
  }

  return {
    title: `${category.name} - huzi.pk`,
    description: `Shop the best ${category.name} at huzi.pk. Explore our curated collection and find the latest trends in ${category.name.toLowerCase()}.`,
    openGraph: {
      title: `${category.name} - huzi.pk`,
      description: `Shop the best ${category.name} at huzi.pk. Explore our curated collection and find the latest trends in ${category.name.toLowerCase()}.`,
      url: `https://huzi.pk/category/${category.slug}`,
      images: [
        {
          url: category.image,
          width: 600,
          height: 400,
          alt: category.name,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryLoader slug={slug} />;
}
