
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock, CreditCard, HelpCircle } from "lucide-react";

const policies = [
    {
        icon: <Truck className="h-8 w-8 text-primary" />,
        title: "Nationwide Delivery",
        description: "We deliver physical products to every corner of Pakistan. No location is out of reach.",
    },
    {
        icon: <Package className="h-8 w-8 text-primary" />,
        title: "Flat Shipping Rate",
        description: "A standard fee of PKR 250 applies to all orders, regardless of size, weight, or destination.",
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        title: "Delivery Time",
        description: "Orders are processed within 1-2 business days and typically arrive within 7-11 business days after dispatch.",
    },
    {
        icon: <CreditCard className="h-8 w-8 text-primary" />,
        title: "Payment Methods",
        description: "We accept Cash on Delivery (COD), Bank Transfer, Easypaisa, and Jazzcash. A Rs. 50 fee applies to COD orders.",
    },
]

export default function ShippingPolicyClient() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <Truck className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Shipping Policy</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Everything you need to know about how we get your order to your doorstep.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {policies.map((policy) => (
                         <Card key={policy.title} className="p-6 flex items-start gap-4 transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                            <div className="flex-shrink-0">{policy.icon}</div>
                            <div>
                                <h3 className="font-headline text-xl font-semibold mb-2 text-foreground">{policy.title}</h3>
                                <p className="text-muted-foreground">{policy.description}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <HelpCircle className="h-8 w-8 mx-auto text-primary mb-2" />
                    <h3 className="font-headline text-xl font-semibold">More Questions?</h3>
                    <p className="text-muted-foreground mt-2">
                        If you have any other questions, please don't hesitate to <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
