import { Metadata } from 'next';
import HowToPayLoader from './how-to-pay-loader';

export const metadata: Metadata = {
    title: "How to Pay - huzi.pk",
    description: "Learn how to pay at huzi.pk. We accept Bank Transfer, EasyPaisa, JazzCash, and Cash on Delivery (COD) for your convenience and security.",
    openGraph: {
        title: "How to Pay - huzi.pk",
        description: "Learn how to pay at huzi.pk. We accept Bank Transfer, EasyPaisa, JazzCash, and Cash on Delivery (COD) for your convenience and security.",
        url: "https://huzi.pk/how-to-pay",
    }
};

export default function HowToPayPage() {
    return <HowToPayLoader />;
}
