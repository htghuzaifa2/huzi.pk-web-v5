
"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CartSheet } from "./cart-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearch } from "@/context/search-context";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";


const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/all-products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const moreNavLinks = [
  { href: "/sale", label: "Sale" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/how-to-pay", label: "How to Pay" },
  { href: "/cash-on-delivery", label: "COD" },
  { href: "/faq", label: "FAQ" },
];

const allNavLinks = [...mainNavLinks, ...moreNavLinks];


export default function Header() {
  const { toggleSearch } = useSearch();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show header at the top of the page
          if (currentScrollY < 50) {
            setIsVisible(true);
          } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up - show header
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY.current + 10) {
            // Scrolling down (with threshold to prevent jitter) - hide header
            setIsVisible(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center gap-2">
          <div className="block sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <SheetHeader className="p-4">
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                </SheetHeader>
                <Link href="/" className="mr-6 mb-6 flex items-center font-bold text-lg px-4" prefetch={true}>
                  <Image src="/favicon.ico" alt="huzi.pk logo" width={24} height={24} className="mr-2" />
                  huzi.pk
                </Link>
                <nav className="flex flex-col space-y-2">
                  {allNavLinks.map(({ href, label }) => (
                    <Link key={label} href={href} className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md" prefetch={true}>
                      <SheetTrigger asChild>
                        <span>{label}</span>
                      </SheetTrigger>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="mr-4 flex items-center" prefetch={true}>
            <Image src="/favicon.ico" alt="huzi.pk logo" width={28} height={28} className="mr-2" />
            <span className="hidden sm:inline-block font-bold text-xl">huzi.pk</span>
            <span className="sm:hidden font-bold text-xl">huzi.pk</span>
          </Link>

          <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium">
            {mainNavLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors text-foreground/60 hover:text-primary"
                prefetch={true}
              >
                {label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground/60 hover:text-primary data-[state=open]:text-primary px-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-transparent data-[state=open]:bg-transparent">
                  More
                  <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {moreNavLinks.map(({ href, label }) => (
                  <DropdownMenuItem key={label} asChild>
                    <Link href={href} prefetch={true}>{label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleSearch}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <CartSheet />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}


