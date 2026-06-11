"use client";

import { FileText, Gavel, ShoppingBag, Truck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TermsAndConditionsClient() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Welcome to huzi.pk. By using our website, you agree to the following terms.
                    </p>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <Gavel className="h-8 w-8 text-primary" />
                                <span>Agreement to Terms</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                By accessing huzi.pk, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <ShoppingBag className="h-8 w-8 text-primary" />
                                <span>Product Use</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                Our products, both physical and digital, are intended for personal use. Unauthorized resale or commercial distribution of our products is strictly prohibited. We reserve the right to refuse service or cancel orders at our discretion.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <Truck className="h-8 w-8 text-primary" />
                                <span>Shipping & Returns</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                Your use of our website is also governed by our <Link href="/shipping-policy" className="text-primary hover:underline">Shipping Policy</Link> and <Link href="/return-policy" className="text-primary hover:underline">Return & Refund Policy</Link>. Please review these documents to understand our practices regarding delivery and returns.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <AlertCircle className="h-8 w-8 text-primary" />
                                <span>Limitation of Liability</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                huzi.pk shall not be liable for any damages arising out of the use or inability to use the products on our site. We strive for accuracy, but we do not warrant that product descriptions or other content are error-free, complete, or current.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl text-primary">
                                Governing Law
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            <p>
                                These terms and conditions are governed by and construed in accordance with the laws of Pakistan, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                            </p>
                            <p className="mt-4 font-semibold italic">Last Updated: December 22, 2025</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
