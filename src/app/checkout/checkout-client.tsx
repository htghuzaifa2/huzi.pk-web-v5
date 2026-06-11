
"use client";

import { useCart } from "@/context/cart-context";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import locationData from "@/data/locations.json";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

// Dynamically import zod and the resolver for smaller initial bundles
const zodPromise = import('zod');
const zodResolverPromise = import('@hookform/resolvers/zod').then(m => m.zodResolver);

let checkoutSchema: z.ZodObject<any>;

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutClient() {
  const { items, total } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [formResolver, setFormResolver] = useState<any>(null);

  useEffect(() => {
      setIsClient(true);
      Promise.all([zodPromise, zodResolverPromise]).then(([z, resolver]) => {
          checkoutSchema = z.object({
              name: z.string().min(2, { message: "Name must be at least 2 characters." }),
              phone: z.string().min(1, { message: "Phone number is required." }).regex(/^\+?[0-9]+$/, { message: "Phone number can only contain digits and an optional leading '+'." }),
              email: z.string().email({ message: "Invalid email format." }).or(z.literal("")).optional(),
              province: z.string({ required_error: "Please select a province." }).min(1, "Please select a province."),
              city: z.string({ required_error: "Please select a city." }).min(1, "Please select a city."),
              address: z.string().optional(),
              paymentMethod: z.enum(["advance", "cod"], { required_error: "Please select a payment method." }),
          });
          setFormResolver(() => resolver(checkoutSchema));
      });
  }, []);
  
  const shippingFee = 250;
  const codFee = 50;
  
  const form = useForm<CheckoutFormValues>({
    resolver: formResolver,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      province: "",
      city: "",
    },
  });

  const selectedProvince = form.watch("province");
  const paymentMethod = form.watch("paymentMethod");
  const cities = locationData.provinces.find(p => p.name === selectedProvince)?.cities || [];
  
  const isCodSelected = paymentMethod === 'cod';
  const finalTotal = total + shippingFee + (isCodSelected ? codFee : 0);

  useEffect(() => {
    if (form.getValues("province")) {
        form.setValue("city", "");
    }
  }, [selectedProvince, form]);


  const onSubmit = (data: CheckoutFormValues) => {
    const myWhatsAppNumber = "923219486948";

    let message = `*New Order from huzi.pk*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${data.name}\n`;
    message += `Phone: ${data.phone}\n`;
    if (data.email) {
      message += `Email: ${data.email}\n`;
    }
    if (data.address) {
      message += `Address: ${data.address}\n`;
    }
    message += `City: ${data.city}\n`;
    message += `Province: ${data.province}\n\n`;
    message += `*Order Summary:*\n`;

    items.forEach(item => {
      message += `- ${item.name} (ID: ${item.id}) (x${item.quantity}) - PKR ${Math.round(item.price * item.quantity)}\n`;
    });
    
    message += `\nSubtotal: PKR ${Math.round(total)}\n`;
    message += `Shipping: PKR ${shippingFee}\n`;
    if (isCodSelected) {
        message += `COD Fee: PKR ${codFee}\n`;
    }
    message += `*Total: PKR ${Math.round(finalTotal)}*\n\n`;
    message += `*Payment Method: ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Advance Payment'}*\n\n`;
    
    if (isCodSelected) {
        message += `Choose Advance Payment to avoid the additional COD fee and enjoy faster processing. Please confirm your order details.`;
    } else {
        message += `Please review your order details and wait for our team to confirm your order. Once confirmed, we will share our official payment information for completing the advance payment`;
    }

    const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (!isClient || !formResolver) {
    return (
        <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-10 w-1/2 mx-auto mb-8" />
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="lg:order-2 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="lg:order-1 space-y-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }
  
  if (items.length === 0) {
      return (
        <div className="container mx-auto px-4 py-12 text-center content-fade-in">
            <h1 className="font-headline text-3xl font-bold">Your Cart is Empty</h1>
            <p className="mt-4 text-muted-foreground">You have no items in your cart to check out.</p>
            <Button asChild className="mt-6">
                <Link href="/">Continue Shopping</Link>
            </Button>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-12 content-fade-in">
      <h1 className="text-center font-headline text-4xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-2 lg:gap-12 gap-8">
        <div className="lg:order-2">
           <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={item.image.url}
                            alt={item.image.alt}
                            fill
                            className="object-contain"
                            sizes="64px"
                          />
                        </div>
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="font-medium text-price">{`PKR ${Math.round(item.price * item.quantity)}`}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p className="font-medium text-price">{`PKR ${Math.round(total)}`}</p>
                  </div>
                   <div className="flex justify-between">
                    <p>Shipping</p>
                    <p className="font-medium text-price">{`PKR ${shippingFee}`}</p>
                  </div>
                  {isCodSelected && (
                    <div className="flex justify-between">
                        <p>Cash on Delivery Fee</p>
                        <p className="font-medium text-price">{`PKR ${codFee}`}</p>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p className="text-price">{`PKR ${Math.round(finalTotal)}`}</p>
                  </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                  You will be redirected to WhatsApp to confirm your order.
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            inputMode="tel"
                            placeholder="Your phone number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Province</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a province" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {locationData.provinces.map(province => (
                                    <SelectItem key={province.name} value={province.name}>{province.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>City</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProvince}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a city" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {cities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Shipping Address (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="House #, Street, Area..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-4"
                            >
                            <Label htmlFor="advance" className={cn(
                                "flex flex-col items-start space-y-1 rounded-md border-2 p-4 cursor-pointer transition-colors relative",
                                field.value === "advance" ? "border-primary bg-primary/5" : "border-muted hover:border-accent-foreground/50"
                            )}>
                                 <RadioGroupItem value="advance" id="advance" className="sr-only" />
                                <span className="font-semibold text-foreground">Advance Payment</span>
                                <span className="text-sm text-muted-foreground">Bank, EasyPaisa, JazzCash</span>
                                {field.value === 'advance' && <CheckCircle className="h-5 w-5 text-primary absolute top-4 right-4" />}
                            </Label>
                            
                            <Label htmlFor="cod" className={cn(
                                "flex flex-col items-start space-y-1 rounded-md border-2 p-4 cursor-pointer transition-colors relative",
                                field.value === "cod" ? "border-primary bg-primary/5" : "border-muted hover:border-accent-foreground/50"
                            )}>
                                <RadioGroupItem value="cod" id="cod" className="sr-only" />
                               <span className="font-semibold text-foreground">Cash on Delivery (COD)</span>
                               <span className="text-sm text-muted-foreground">Pay at your doorstep. <span className="font-bold text-foreground">(+Rs.50 Fee)</span></span>
                               {field.value === 'cod' && <CheckCircle className="h-5 w-5 text-primary absolute top-4 right-4" />}
                            </Label>

                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                  <Button type="submit" className="w-full" size="lg">Place Order on WhatsApp</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
