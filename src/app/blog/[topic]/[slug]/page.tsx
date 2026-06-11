import "@/styles/blog.css"
import { getBlogPost, getAllBlogRoutes } from "@/lib/blog"
import { notFound } from "next/navigation"
import BlogRelatedProducts from "@/components/blog-related-products"
import BlogContent from "@/components/blog-content"

// Force static generation — blog.ts uses Node.js fs which is unavailable on CF Pages edge
export const dynamic = 'force-static'

export async function generateStaticParams() {
    const routes = getAllBlogRoutes()
    return routes.map(r => ({ topic: r.topic, slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string; slug: string }> }) {
    try {
        const { topic, slug } = await params
        const post = getBlogPost(topic, slug)
        if (!post) return {}

        return {
            title: `${post.title} - huzi.pk`,
            description: post.description,
            openGraph: {
                title: `${post.title} - huzi.pk`,
                description: post.description,
                type: 'article',
                url: `https://huzi.pk/blog/${topic}/${slug}`,
                images: post.image ? [{ url: post.image }] : undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title: `${post.title} - huzi.pk`,
                description: post.description,
                images: post.image ? [post.image] : undefined,
            },
        }
    } catch (error) {
        return {}
    }
}

export default async function BlogPost({ params }: { params: Promise<{ topic: string; slug: string }> }) {
    try {
        const { topic, slug } = await params
        const decodedTopic = decodeURIComponent(topic)
        const decodedSlug = decodeURIComponent(slug)
        const post = getBlogPost(decodedTopic, decodedSlug)

        return (
            <>
                <div className="container mx-auto py-12 px-4">
                    <article className="blog-post max-w-4xl mx-auto">
                        <h1 className="blog-title text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
                            {post.title}
                        </h1>

                        <div className="flex justify-center mb-12">
                            <span className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase border-b border-border pb-1">
                                {decodedTopic}
                            </span>
                        </div>

                        <BlogContent content={post.content} />
                    </article>
                </div>

                {/* Related products section */}
                <div className="container mx-auto px-4 pb-16">
                    <BlogRelatedProducts />
                </div>
            </>
        )
    } catch (error) {
        console.error("Error loading blog post:", error)
        notFound()
    }
}
