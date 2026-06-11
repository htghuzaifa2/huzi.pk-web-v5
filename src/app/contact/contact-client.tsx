
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactClient() {
    const { toast } = useToast();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    const onSubmit = (data: ContactFormValues) => {
        const myWhatsAppNumber = "923219486948";
        let message = `*New Contact Inquiry from huzi.pk*\n\n`;
        message += `*Name:* ${data.name}\n`;
        message += `*Email:* ${data.email}\n`;
        message += `*Message:*\n${data.message}`;

        const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: "Message Prepared",
          description: "Please send the message in WhatsApp to complete your inquiry.",
        });

        form.reset();
    };


    return (
        <div className="container mx-auto px-4 py-12 md:py-16 content-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Get In Touch</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, our team is here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <Card className="flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                        <Mail className="h-12 w-12 text-primary mb-4" />
                        <CardTitle className="font-headline text-2xl">Email Us</CardTitle>
                        <CardDescription className="mt-2">For support, inquiries, or feedback.</CardDescription>
                        <a href="mailto:contact@huzi.pk" className="mt-4 font-semibold text-primary hover:underline">
                            contact@huzi.pk
                        </a>
                    </Card>
                     <Card className="flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                        <Phone className="h-12 w-12 text-primary mb-4" />
                        <CardTitle className="font-headline text-2xl">Call Us</CardTitle>
                        <CardDescription className="mt-2">Talk to a team member directly.</CardDescription>
                        <p className="mt-4 font-semibold text-foreground">+92 321 9486948</p>
                    </Card>
                </div>

                <Card className="max-w-2xl mx-auto shadow-lg">
                    <CardHeader className="text-center">
                        <MessageSquare className="h-10 w-10 mx-auto text-primary mb-2" />
                        <CardTitle className="font-headline text-3xl">Send us a Message</CardTitle>
                        <CardDescription>Fill out the form below and we'll get back to you via WhatsApp.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Your email address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Message</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Type your message here..." {...field} rows={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" size="lg">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Message via WhatsApp
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
