import { Metadata } from 'next';
import ShippingPolicyLoader from './shipping-policy-loader';

export const metadata: Metadata = {
    title: "Shipping Policy - huzi.pk",
    description: "Learn about huzi.pk's shipping policy. We offer a flat delivery rate across Pakistan with an estimated delivery time of 7-11 business days.",
    openGraph: {
        title: "Shipping Policy - huzi.pk",
        description: "Learn about huzi.pk's shipping policy. We offer a flat delivery rate across Pakistan with an estimated delivery time of 7-11 business days.",
        url: "https://huzi.pk/shipping-policy",
    }
};

export default function ShippingPolicyPage() {
    return <ShippingPolicyLoader />;
}
