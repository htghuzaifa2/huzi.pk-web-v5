import type { Metadata } from 'next';
import AboutLoader from './about-loader';

export const metadata: Metadata = {
    title: "About Us - huzi.pk",
    description: "Learn about huzi.pk's mission to bring quality, style, and innovation to online shopping in Pakistan. Discover our story and what we stand for.",
    openGraph: {
        title: "About Us - huzi.pk",
        description: "Learn about huzi.pk's mission to bring quality, style, and innovation to online shopping in Pakistan. Discover our story and what we stand for.",
        url: "https://huzi.pk/about",
    }
};

export default function AboutPage() {
    return <AboutLoader />;
}
