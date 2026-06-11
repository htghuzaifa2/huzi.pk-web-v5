import { Metadata } from "next"
import { getAllBlogMetadata } from "@/lib/blog"
import BlogListing from "@/components/blog-listing"

// Force static generation — blog.ts uses Node.js fs which is unavailable on CF Pages edge
export const dynamic = 'force-static'

export const metadata: Metadata = {
    title: "Blog - huzi.pk",
    description: "Browse all blog posts on technology, guides, privacy, Linux, and more at huzi.pk",
    openGraph: {
        title: "Blog - huzi.pk",
        description: "Browse all blog posts on technology, guides, privacy, Linux, and more at huzi.pk",
        type: "website",
        url: "https://huzi.pk/blog",
    },
}

export default function BlogPage() {
    const posts = getAllBlogMetadata()

    return <BlogListing posts={posts} />
}
