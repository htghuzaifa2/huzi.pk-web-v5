
import { Metadata } from 'next';
import SaleLoader from './sale-loader';

export const metadata: Metadata = {
    title: 'Sale - huzi.pk',
    description: 'Exclusive Flash Sales: You May see 1 product twice dont miss out buy it fast it may be removed or deleted...',
};

export default function SalePage() {
    return <SaleLoader />;
}
