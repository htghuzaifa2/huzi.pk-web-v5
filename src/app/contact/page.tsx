import { Metadata } from "next";
import ContactLoader from "./contact-loader";

export const metadata: Metadata = {
    title: "Contact Us - huzi.pk",
    description: "Contact huzi.pk for questions about products, orders, or support. We're here to help you. Reach us by email, phone, or our contact form.",
    openGraph: {
        title: "Contact Us - huzi.pk",
        description: "Contact huzi.pk for questions about products, orders, or support. We're here to help you. Reach us by email, phone, or our contact form.",
        url: "https://huzi.pk/contact",
    }
};

export default function ContactPage() {
    return <ContactLoader />;
}
