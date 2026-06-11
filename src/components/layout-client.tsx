"use client";

import dynamic from 'next/dynamic';

// Lazy-loaded overlay components - not needed for initial paint
const SearchBar = dynamic(() => import('@/components/search-bar'), { ssr: false });
const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => ({ default: mod.Toaster })), { ssr: false });
const Lightbox = dynamic(() => import('@/context/lightbox-context').then(mod => ({ default: mod.Lightbox })), { ssr: false });

export { SearchBar, Toaster, Lightbox };
