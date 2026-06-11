
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

const faqData = [
    {
        question: "What are your shipping charges?",
        answer: "We offer a flat shipping rate of PKR 250 on all orders across Pakistan, no matter how many items you order."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept Cash on Delivery (COD), Easypaisa, Jazzcash, or direct Bank Transfer. For COD orders, there is an additional fee of Rs. 50 charged by the courier for handling cash."
    },
    {
        question: "How long does delivery take?",
        answer: "Orders are typically dispatched within 1-2 business days. Delivery usually takes between 7-11 business days, depending on your location in Pakistan."
    },
    {
        question: "Do you ship internationally?",
        answer: "Currently, we deliver physical products only within Pakistan. However, our digital products are available for purchase and download worldwide."
    },
    {
        question: "What is your return policy?",
        answer: "We have a customer-friendly return policy for damaged, incorrect, or faulty items. For a complete refund, including delivery charges, please review our detailed <a href='/return-policy' class='text-primary font-semibold hover:underline'>Return & Refund Policy</a>."
    },
    {
        question: "How can I contact customer service?",
        answer: "You can reach us through our <a href='/contact' class='text-primary font-semibold hover:underline'>contact page</a>, by emailing us at contact@huzi.pk, or by calling us at +92 321 9486948. We're always happy to help!"
    }
];

export default function FaqClient() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                     <HelpCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Have questions? We've got answers. If you can't find what you're looking for, feel free to <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
                    </p>
                </div>

                <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border/50">
                    <Accordion type="single" collapsible className="w-full">
                        {faqData.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline text-foreground">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="text-muted-foreground prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.answer }} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
