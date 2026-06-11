import { Metadata } from 'next';
import CashOnDeliveryLoader from './cash-on-delivery-loader';

export const metadata: Metadata = {
    title: "Cash on Delivery (COD) - huzi.pk",
    description: "Learn about Cash on Delivery (COD) at huzi.pk. Pay for your order in cash upon delivery. See the process, fees, and details for Pakistan-wide shipping.",
    openGraph: {
        title: "Cash on Delivery (COD) - huzi.pk",
        description: "Learn about Cash on Delivery (COD) at huzi.pk. Pay for your order in cash upon delivery. See the process, fees, and details for Pakistan-wide shipping.",
        url: "https://huzi.pk/cash-on-delivery",
    }
};

export default function CashOnDeliveryPage() {
    return <CashOnDeliveryLoader />;
}
