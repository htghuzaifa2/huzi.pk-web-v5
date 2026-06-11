import type { Metadata } from 'next';
import CategoriesLoader from './categories-loader';

export const metadata: Metadata = {
  title: 'Product Categories - huzi.pk',
  description: 'Explore all product categories at huzi.pk. Browse our curated collections of fashion, tech, digital goods, and more to find exactly what you need.',
  openGraph: {
      title: 'Product Categories - huzi.pk',
      description: 'Explore all product categories at huzi.pk. Browse our curated collections of fashion, tech, digital goods, and more to find exactly what you need.',
      url: 'https://huzi.pk/categories',
  }
};

export default function CategoriesPage() {
  return <CategoriesLoader />;
}
