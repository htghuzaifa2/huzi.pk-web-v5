"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import type { BlogMetadata } from "@/lib/blog"

const POSTS_PER_PAGE = 20

interface BlogListingProps {
    posts: BlogMetadata[]
}

export default function BlogListing({ posts }: BlogListingProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Initialize from URL on client-side only
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const q = params.get("q") || ""
        const page = parseInt(params.get("page") || "1", 10)
        setSearchQuery(q)
        setCurrentPage(page)
    }, [])

    // Update URL when search or page changes
    const updateUrl = useCallback((page: number, query: string) => {
        if (typeof window === "undefined") return

        const params = new URLSearchParams()
        if (query) params.set("q", query)
        if (page > 1) params.set("page", page.toString())

        const queryString = params.toString()
        const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname

        window.history.pushState({}, "", newUrl)
    }, [])

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
        updateUrl(1, value)
    }

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        updateUrl(page, searchQuery)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Filter posts based on search query
    const filteredPosts = useMemo(() => {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return posts

        return posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(query)
            const excerptMatch = post.excerpt.toLowerCase().includes(query)
            const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(query))
            const topicMatch = post.topic.toLowerCase().includes(query)
            return titleMatch || excerptMatch || tagsMatch || topicMatch
        })
    }, [posts, searchQuery])

    // Calculate pagination
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * POSTS_PER_PAGE
        return filteredPosts.slice(start, start + POSTS_PER_PAGE)
    }, [filteredPosts, currentPage])

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = []
        const showEllipsisStart = currentPage > 3
        const showEllipsisEnd = currentPage < totalPages - 2

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (showEllipsisStart) {
                pages.push("ellipsis")
            }
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i)
            }
            if (showEllipsisEnd) {
                pages.push("ellipsis")
            }
            if (!pages.includes(totalPages)) pages.push(totalPages)
        }
        return pages
    }

    // Format date
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            })
        } catch {
            return dateStr
        }
    }

    // Get topic color
    const getTopicColor = (topic: string) => {
        const colors: Record<string, string> = {
            guides: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            tech: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            sports: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
            design: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
            updates: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
            products: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        }
        return colors[topic] || "bg-muted text-muted-foreground"
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="border-b bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                            All Blogs
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl mb-8">
                            Discover {posts.length} articles on technology, guides, privacy, and more
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search blogs by title, topic, or tags..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-12 h-14 text-lg rounded-2xl border-2 focus:border-primary transition-colors"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSearchChange("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Results count */}
                        {searchQuery && (
                            <p className="mt-4 text-muted-foreground">
                                Found {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-semibold mb-2">No blogs found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search terms or browse all posts
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleSearchChange("")}
                        >
                            Clear search
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                            {paginatedPosts.map((post) => (
                                <Link
                                    key={`${post.topic}-${post.slug}`}
                                    href={`/blog/${post.topic}/${post.slug}`}
                                    className="group"
                                >
                                    <Card className="h-full flex flex-col hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden">
                                        {/* Topic Badge */}
                                        <div className="px-4 pt-4">
                                            <Badge className={`${getTopicColor(post.topic)} text-xs font-medium`}>
                                                {post.topic}
                                            </Badge>
                                        </div>

                                        <CardHeader className="pb-2 pt-3 px-4">
                                            <h2 className="text-base md:text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h2>
                                        </CardHeader>

                                        <CardContent className="flex-grow px-4 pb-2">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        </CardContent>

                                        <CardFooter className="flex items-center justify-between pt-2 px-4 pb-4 border-t mt-auto">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{formatDate(post.date)}</span>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {getPageNumbers().map((page, index) => (
                                    page === "ellipsis" ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                                    ) : (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </Button>
                                    )
                                ))}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Page info */}
                        {totalPages > 1 && (
                            <p className="text-center text-muted-foreground text-sm mt-4">
                                Page {currentPage} of {totalPages} ({filteredPosts.length} posts)
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
