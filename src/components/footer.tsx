
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { WhatsappIcon } from "@/components/whatsapp-icon";
import Image from "next/image";


export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block text-2xl font-bold" prefetch={true}>
              huzi.pk
            </Link>
            <p className="text-sm text-muted-foreground">
              Your destination for premium quality modern clothing. Delivering physical products across Pakistan and digital products worldwide.
            </p>
            <div className="text-sm text-muted-foreground">
              <a href="mailto:contact@huzi.pk" className="hover:text-primary">contact@huzi.pk</a>
            </div>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/sale" className="text-muted-foreground hover:text-primary transition-colors font-bold text-red-500" prefetch={true}>Sale</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>Blog</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>Terms & Conditions</Link></li>
              <li><Link href="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>Return Policy</Link></li>
              <li><Link href="/how-to-pay" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>How to Pay</Link></li>
              <li><Link href="/cash-on-delivery" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>COD</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors" prefetch={true}>FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <Link href="https://youtube.com/@huzi.pk_website?si=BtT-sxl2VxceXRa3" target="_blank" rel="noopener noreferrer" aria-label="huzi.pk on Youtube" className="text-muted-foreground hover:text-primary transition-transform hover:scale-110">
                <Youtube className="h-6 w-6" />
              </Link>
              <Link href="https://www.facebook.com/profile.php?id=61576677910935" target="_blank" rel="noopener noreferrer" aria-label="huzi.pk on Facebook" className="text-muted-foreground hover:text-primary transition-transform hover:scale-110">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="https://www.instagram.com/website_huzi.pk/profilecard/?igsh=am04eHZjcTBzMjFh" target="_blank" rel="noopener noreferrer" aria-label="huzi.pk on Instagram" className="text-muted-foreground hover:text-primary transition-transform hover:scale-110">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="https://wa.me/message/BY3URMYOW3OMH1" target="_blank" rel="noopener noreferrer" aria-label="huzi.pk on WhatsApp" className="text-muted-foreground hover:text-primary transition-transform hover:scale-110">
                <WhatsappIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground transition-colors hover:text-primary">
          &copy; {new Date().getFullYear()} huzi.pk. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
