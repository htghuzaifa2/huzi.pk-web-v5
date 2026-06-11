import type { Metadata } from 'next';
import PrivacyPolicyLoader from './privacy-policy-loader';

export const metadata: Metadata = {
    title: "Privacy Policy - huzi.pk",
    description: "Read our privacy policy to understand how we value your privacy and handle information at huzi.pk. We do not collect any user data.",
    openGraph: {
        title: "Privacy Policy - huzi.pk",
        description: "Read our privacy policy to understand how we value your privacy and handle information at huzi.pk. We do not collect any user data.",
        url: "https://huzi.pk/privacy-policy",
    }
};

export default function PrivacyPolicyPage() {
    return <PrivacyPolicyLoader />;
}
