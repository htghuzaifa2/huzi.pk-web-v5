
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ShippingInfo from "@/components/shipping-info";

interface ProductInfoAccordionProps {
    description?: string;
    specifications?: Record<string, string>;
}

export default function ProductInfoAccordion({ description, specifications }: ProductInfoAccordionProps) {
    const hasDescription = description && description.trim() !== "";
    const hasSpecifications = specifications && Object.keys(specifications).length > 0;
    
    // Determine the default opened item.
    const defaultOpenValue = hasDescription ? "description" : hasSpecifications ? "specifications" : "shipping";

    return (
        <Accordion type="single" collapsible defaultValue={defaultOpenValue} className="w-full">
            {hasDescription && (
                <AccordionItem value="description">
                    <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                        Description
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground prose max-w-none pt-2">
                        <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
                    </AccordionContent>
                </AccordionItem>
            )}

            {hasSpecifications && (
                <AccordionItem value="specifications">
                     <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                        Specifications
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <ul className="space-y-3 text-muted-foreground pt-2">
                            {Object.entries(specifications).map(([key, value]) => (
                                <li key={key} className="flex justify-between border-b pb-3 text-sm">
                                    <span className="font-semibold text-foreground">{key}</span>
                                    <span>{value}</span>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            )}
            
            <AccordionItem value="shipping">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                    Shipping & Delivery
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    <ShippingInfo />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
