import { Metadata } from 'next';
import ReturnPolicyLoader from './return-policy-loader';

export const metadata: Metadata = {
    title: "Return & Refund Policy - huzi.pk",
    description: "Review the return and refund policy at huzi.pk. We offer a full refund, including shipping, for damaged, incorrect, or faulty items within 3 days.",
    openGraph: {
        title: "Return & Refund Policy - huzi.pk",
        description: "Review the return and refund policy at huzi.pk. We offer a full refund, including shipping, for damaged, incorrect, or faulty items within 3 days.",
        url: "https://huzi.pk/return-policy",
    }
};

export default function ReturnPolicyPage() {
    return <ReturnPolicyLoader />;
}
