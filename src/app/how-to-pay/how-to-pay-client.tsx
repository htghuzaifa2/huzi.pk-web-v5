
"use client";

import { Banknote, Smartphone, AlertTriangle, HelpCircle, PackageCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function HowToPayClient() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Payment Methods</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                       Secure and convenient options to complete your purchase at huzi.pk.
                    </p>
                </div>

                <div className="grid md:grid-cols-1 gap-8 mb-12">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <PackageCheck className="h-8 w-8 text-primary" />
                                <span>Cash on Delivery (COD)</span>
                            </CardTitle>
                            <CardDescription>Pay in cash when your order arrives.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-muted-foreground">
                            <p>You can pay in cash to the courier rider upon receiving your parcel. This is the most convenient way to shop!</p>
                            <p className="font-semibold text-primary">A standard fee of Rs. 50 will be charged by the courier for all Cash on Delivery orders.</p>
                        </CardContent>
                    </Card>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-background px-4 text-muted-foreground font-semibold uppercase">Or Pay in Advance</span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                         <Card className="transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                    <Banknote className="h-8 w-8 text-primary" />
                                    <span>Bank Transfer</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-muted-foreground">
                                <div>
                                    <p className="font-semibold text-foreground">Bank</p>
                                    <p>Meezan Bank Limited</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Account Title</p>
                                    <p>Muhammad Huzaifa Tanveer</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Account Number</p>
                                    <p className="font-mono text-base tracking-wider">00300112449820</p>
                                </div>
                                 <div>
                                    <p className="font-semibold text-foreground">IBAN</p>
                                    <p className="font-mono text-base tracking-wider">PK95MEZN0000300112449820</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                    <Smartphone className="h-8 w-8 text-primary" />
                                    <span>JazzCash / EasyPaisa</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-muted-foreground">
                               <div>
                                    <p className="font-semibold text-foreground">Account Title</p>
                                    <p>Muhammad Huzaifa Tanveer</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Account Number</p>
                                    <p className="font-mono text-base tracking-wider">0321-9486948</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="bg-muted/50 border-primary/20">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                            <span>Important Notes</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground pt-4">
                       <ul className="space-y-2">
                            <li>Please wait for an availability confirmation message or call before making any advance payment.</li>
                            <li>After sending an advance payment, please share your payment screenshot on WhatsApp: <strong className="text-foreground">0321-9486948</strong>.</li>
                       </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
