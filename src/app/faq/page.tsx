import { Metadata } from 'next';
import FaqLoader from './faq-loader';

export const metadata: Metadata = {
    title: "FAQ - huzi.pk",
    description: "Find answers to common questions about huzi.pk. Learn about shipping, payments, returns, and how to place an order. Your questions, answered.",
    openGraph: {
        title: "FAQ - huzi.pk",
        description: "Find answers to common questions about huzi.pk. Learn about shipping, payments, returns, and how to place an order. Your questions, answered.",
        url: "https://huzi.pk/faq",
    }
};

export default function FaqPage() {
    return <FaqLoader />;
}
