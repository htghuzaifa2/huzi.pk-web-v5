
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/context/search-context";
import { cn } from "@/lib/utils";

const MAX_RECENT_SEARCHES = 5;

export default function SearchBar() {
    const { isSearchOpen, closeSearch } = useSearch();
    const [query, setQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedSearches = localStorage.getItem("recentSearches");
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }
    }, []);

    useEffect(() => {
        if (isSearchOpen) {
            inputRef.current?.focus();
        }
    }, [isSearchOpen]);
    
     useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeSearch();
            }
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                // A bit of a hack to prevent closing when the search icon is clicked
                const triggerButton = (event.target as HTMLElement).closest('button');
                const svg = triggerButton?.querySelector('svg');
                if (svg?.classList.contains('lucide-search')) return;
                
                closeSearch();
            }
        };

        if (isSearchOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, closeSearch]);

    const updateRecentSearches = (searchTerm: string) => {
        const updatedSearches = [searchTerm, ...recentSearches.filter(s => s.toLowerCase() !== searchTerm.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    };

    const handleSearchSubmit = (searchTerm: string) => {
        const trimmedQuery = searchTerm.trim();
        if (trimmedQuery) {
            updateRecentSearches(trimmedQuery);
            setQuery("");
            closeSearch();
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchSubmit(query);
        }
    };
    
    const removeRecentSearch = (e: React.MouseEvent, searchTerm: string) => {
        e.stopPropagation();
        const updatedSearches = recentSearches.filter(s => s !== searchTerm);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    };

    const clearAllRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("recentSearches");
    };

    return (
        <div 
            ref={searchBarRef}
            className={cn(
                "w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b overflow-hidden transition-all duration-300 ease-in-out",
                isSearchOpen ? "max-h-96 py-6" : "max-h-0 py-0 border-transparent"
            )}
        >
            <div className="container">
                <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search products..."
                            className="pl-10 h-11"
                        />
                    </div>
                    <Button type="submit" onClick={() => handleSearchSubmit(query)} size="lg">
                        Search
                    </Button>
                     <Button variant="ghost" size="icon" onClick={closeSearch}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close Search</span>
                    </Button>
                </div>

                {recentSearches.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Recent Searches
                            </h3>
                            <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={clearAllRecentSearches}>
                                Clear all
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((searchTerm) => (
                                <button
                                    key={searchTerm}
                                    onClick={() => handleSearchSubmit(searchTerm)}
                                    className="relative flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-sm rounded-full py-1 pr-7 pl-3"
                                >
                                    {searchTerm}
                                    <div
                                        onClick={(e) => removeRecentSearch(e, searchTerm)}
                                        className="absolute top-1/2 right-1 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full hover:bg-background"
                                        aria-label="Remove search term"
                                    >
                                        <X className="h-3 w-3" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
