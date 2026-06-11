"use client";

import { ShieldCheck, Info, EyeOff, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyClient() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Your privacy is our priority. At huzi.pk, we believe in radical transparency.
                    </p>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <EyeOff className="h-8 w-8 text-primary" />
                                <span>No Data Collection</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                We value your privacy above all else. Unlike many other websites, <strong>huzi.pk does not collect, store, or process any personal user data</strong>.
                            </p>
                            <ul>
                                <li>We do not have a user registration system.</li>
                                <li>We do not track your browsing habits.</li>
                                <li>We do not use tracking cookies to identify you.</li>
                                <li>We do not sell or share any information with third parties, as we don't have it to begin with.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <Info className="h-8 w-8 text-primary" />
                                <span>Order Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                When you place an order with us, the information you provide (such as your name, delivery address, and phone number) is used <strong>solely for the purpose of fulfilling your order</strong> and ensuring it reaches you safely. This information is not used for marketing purposes or stored beyond what is necessary to complete the transaction and provide customer support.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                <Lock className="h-8 w-8 text-primary" />
                                <span>Advertising & Third-Party Services</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                Our website may contain links to third-party services (such as WhatsApp for customer support or YouTube for product videos). Please be aware that these external sites have their own privacy policies, and we do not accept any responsibility or liability for their practices.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">Ezoic Data Collection Settings</h3>
                            <p>
                                We use Ezoic as our advertising and site optimization platform. While Ezoic provides features that can collect first-party data (such as emails or phone numbers from forms or logins), <strong>huzi.pk has disabled these features</strong>.
                            </p>

                            <p className="mt-4"><strong>Specifically:</strong></p>
                            <ul>
                                <li>We do not use Ezoic to collect data from login forms</li>
                                <li>We do not use newsletter or email capture forms through Ezoic</li>
                                <li>We do not share first-party form data (such as emails or phone numbers) with Ezoic advertising partners</li>
                            </ul>

                            <p className="mt-4">Any data processing by Ezoic is therefore limited to what is required for:</p>
                            <ul>
                                <li>Serving advertisements</li>
                                <li>Measuring ad performance</li>
                                <li>Fraud prevention</li>
                                <li>Site analytics and optimization</li>
                            </ul>

                            <p className="mt-4">
                                Ezoic's full privacy policy and details about their data practices are available here:{" "}
                                <a href="https://www.ezoic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    https://www.ezoic.com/privacy
                                </a>
                            </p>

                            <span id="ezoic-privacy-policy-embed"></span>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl text-primary">
                                Changes to This Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            <p>
                                We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
                            </p>
                            <p className="mt-4 font-semibold italic">Effective Date: January 25, 2026</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
