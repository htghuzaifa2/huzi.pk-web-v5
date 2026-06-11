
"use client";

import { Package, Truck, Wallet, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CashOnDeliveryClient() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <Wallet className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="text-center font-headline text-4xl md:text-5xl font-bold">Cash on Delivery (COD)</h1>
                    <p className="text-center text-lg text-muted-foreground mt-4">
                       Pay for your order in cash when it arrives at your doorstep. Here’s everything you need to know.
                    </p>
                </div>

                <Card className="mb-12 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                            <Truck className="h-8 w-8 text-primary" />
                            <span>How It Works: Step-by-Step</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-muted-foreground">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">1</div>
                                <div className="h-6 w-0.5 bg-border my-1"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground text-lg">Place Your Order</h3>
                                <p>Select your desired products and proceed to checkout. Fill in your shipping details accurately.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                                <div className="h-6 w-0.5 bg-border my-1"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground text-lg">Choose COD</h3>
                                <p>In the payment section, select "Cash on Delivery (COD)" as your payment method.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                             <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                                <div className="h-6 w-0.5 bg-border my-1"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground text-lg">Confirm via WhatsApp</h3>
                                <p>You'll be redirected to WhatsApp to confirm your order details with our team. This step is mandatory to process your order.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">4</div>
                            <div>
                                <h3 className="font-semibold text-foreground text-lg">Pay at Your Doorstep</h3>
                                <p>Our courier partner will deliver the parcel to your address. Please have the exact cash amount ready to pay the rider upon delivery.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/50 border-primary/50 mb-16">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                            <span>COD Fee & Important Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                       <p>
                         A standard fee of <strong className="text-foreground">Rs. 50</strong> is automatically added to all Cash on Delivery orders. This fee is charged by the courier service for handling cash transactions.
                       </p>
                       <p>
                        To avoid this extra charge and enjoy faster processing, we recommend using our <Link href="/how-to-pay" className="text-primary font-semibold hover:underline">Advance Payment</Link> options like Bank Transfer, EasyPaisa, or JazzCash.
                       </p>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Info className="h-8 w-8 mx-auto text-primary mb-2" />
                    <h3 className="font-headline text-xl font-semibold">Ready to Shop?</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                        Browse our collections and enjoy the convenience of paying when your order arrives.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/all-products">Start Shopping</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
