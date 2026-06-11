
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, HeartHandshake, Box, Phone } from "lucide-react";

export default function ReturnPolicyClient() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <HeartHandshake className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Return & Refund Policy</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        We stand by our products and are committed to your satisfaction. Here's our promise to you.
                    </p>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <span>Conditions for a Return</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                             <p>
                                We accept returns only if the item you received meets one of the following conditions:
                            </p>
                            <ul>
                                <li>The item is damaged during shipping or has a manufacturing defect.</li>
                                <li>The item is incorrect and does not match the product you ordered.</li>
                                <li>The item is not working correctly as described.</li>
                            </ul>
                            <p className="font-semibold">Return Timeframe: You must notify us within 3 days of receiving your parcel.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <XCircle className="h-8 w-8 text-destructive" />
                                <span>What We Don't Cover</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                           <p>
                                We do not accept returns or provide refunds if you have simply changed your mind about a product. We encourage you to review your order carefully before purchasing.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl text-primary">
                                <Box className="h-8 w-8" />
                                <span>Our Full Refund Promise</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                             <p>
                                We stand by the quality of our products and want you to shop with complete confidence. Once your return is approved and we receive the returned item, we will process your refund. Our commitment to you is a complete and hassle-free refund:
                            </p>
                            <ul>
                                <li><strong className="text-foreground">Full Refund Amount:</strong> We will refund the entire amount of your order, including the original delivery charges and any Cash on Delivery (COD) fees paid.</li>
                                <li><strong className="text-foreground">Return Shipping Covered:</strong> We will also reimburse you for the courier charges you incur to send the product back to us. Your refund will be a full, no-cost-to-you transaction.</li>
                            </ul>
                            <p>
                                The refund will be processed through a mutually agreed-upon method, such as a bank transfer or mobile wallet.
                            </p>
                        </CardContent>
                    </Card>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <Phone className="h-8 w-8 text-primary" />
                                <span>How to Initiate a Return</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                             <p>
                                To initiate a return for a damaged, incorrect, or faulty item, please <Link href="/contact">contact our customer service team</Link> with your order number and clear photos or a video showing the issue. We will guide you through the next steps.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
