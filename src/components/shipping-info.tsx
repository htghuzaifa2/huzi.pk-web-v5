
import Link from "next/link";
import { Truck, Package, Clock } from "lucide-react";

export default function ShippingInfo() {
  return (
    <div className="prose prose-sm max-w-none text-muted-foreground">
        <ul className="not-prose list-none p-0 space-y-4">
            <li className="flex items-start gap-4">
                <Truck className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
                <div>
                    <strong className="text-foreground">Nationwide Delivery</strong>
                    <p className="m-0">We deliver physical products to every corner of Pakistan.</p>
                </div>
            </li>
            <li className="flex items-start gap-4">
                <Package className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
                <div>
                    <strong className="text-foreground">Flat Shipping Rate</strong>
                    <p className="m-0">A standard fee of PKR 250 applies to all orders, regardless of size.</p>
                </div>
            </li>
            <li className="flex items-start gap-4">
                <Clock className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
                <div>
                    <strong className="text-foreground">Estimated Delivery Time</strong>
                    <p className="m-0">Orders typically arrive within 7-11 business days after dispatch.</p>
                </div>
            </li>
        </ul>
      <p className="mt-4">
        For more detailed information, please see our full{" "}
        <Link href="/shipping-policy" className="text-primary hover:underline">
          Shipping Policy
        </Link>.
      </p>
    </div>
  );
}
