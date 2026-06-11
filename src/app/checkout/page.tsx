import CheckoutLoader from "./checkout-loader";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Checkout - huzi.pk",
    description: "Complete your purchase at huzi.pk. Enter your shipping and payment details to securely place your order for delivery anywhere in Pakistan.",
    openGraph: {
        title: "Checkout - huzi.pk",
        description: "Complete your purchase at huzi.pk. Enter your shipping and payment details to securely place your order for delivery anywhere in Pakistan.",
        url: "https://huzi.pk/checkout",
    }
};

export default function CheckoutPage() {
  return <CheckoutLoader />;
}
