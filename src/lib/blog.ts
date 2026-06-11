import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { marked } from "marked"

const ROOT = path.join(process.cwd(), "src/data/blogs/posts")

export interface BlogPost {
    title: string
    description: string
    date: string
    content: string
    slug: string
    topic: string
    [key: string]: any
}

// Configure renderer once
const renderer = new marked.Renderer()
const linkRenderer = renderer.link
renderer.link = (token: any) => {
    const href = token.href
    // Internal links (relative paths or huzi.pk) — same tab, marked for client-side nav
    if (href?.startsWith("/") || href?.includes("huzi.pk")) {
        // Normalize absolute huzi.pk URLs to relative paths
        let relativeHref = href
        if (href.includes("huzi.pk/")) {
            try {
                const url = new URL(href)
                relativeHref = url.pathname
            } catch {
                // keep as-is
            }
        }
        const tokenCopy = { ...token, href: relativeHref }
        const html = linkRenderer.call(renderer, tokenCopy)
        return html.replace(/^<a /, '<a data-internal-link="true" ')
    }
    // External links — open in new tab
    const html = linkRenderer.call(renderer, token)
    if (href?.startsWith("http")) {
        return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ')
    }
    return html
}

function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

renderer.code = (token: any) => {
    if (token.lang === 'mermaid') {
        return `<pre class="mermaid">${escapeHtml(token.text)}</pre>`
    }
    // Default rendering for other code blocks
    const lang = (token.lang || '').match(/\S*/)[0];
    const code = token.text.replace(/\n$/, '')

    if (!lang) {
        return '<pre><code>' + code + '</code></pre>\n';
    }

    return '<pre><code class="language-' + lang + '">' + code + '</code></pre>\n';
}

marked.setOptions({ renderer })

export function getBlogPost(topic: string, slug: string): BlogPost {
    const filePath = path.join(ROOT, topic, `${slug}.md`)
    const file = fs.readFileSync(filePath, "utf-8")

    const { content, data } = matter(file)

    return {
        ...data,
        topic,
        slug,
        content: marked(content) as string
    } as BlogPost
}

export function getAllBlogRoutes() {
    if (!fs.existsSync(ROOT)) return []

    const topics = fs.readdirSync(ROOT)

    return topics.flatMap(topic => {
        const topicPath = path.join(ROOT, topic)
        if (!fs.statSync(topicPath).isDirectory()) return []

        const files = fs.readdirSync(topicPath)
        return files
            .filter(file => file.endsWith(".md"))
            .map(file => ({
                topic,
                slug: file.replace(".md", "")
            }))
    })
}

/**
 * Generate a unique slug for a blog post within a topic.
 * If the slug already exists, appends -2, -3, etc.
 */
export function generateUniqueSlug(topic: string, baseSlug: string): string {
    const topicPath = path.join(ROOT, topic)

    // Ensure topic directory exists
    if (!fs.existsSync(topicPath)) {
        fs.mkdirSync(topicPath, { recursive: true })
        return baseSlug
    }

    const existingFiles = fs.readdirSync(topicPath).filter(f => f.endsWith(".md"))
    const existingSlugs = existingFiles.map(f => f.replace(".md", ""))

    // If base slug doesn't exist, use it
    if (!existingSlugs.includes(baseSlug)) {
        return baseSlug
    }

    // Find the next available number
    let counter = 2
    let newSlug = `${baseSlug}-${counter}`

    while (existingSlugs.includes(newSlug)) {
        counter++
        newSlug = `${baseSlug}-${counter}`
    }

    return newSlug
}

/**
 * Create a URL-friendly slug from a title
 */
export function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim()
}

/**
 * Blog metadata interface for listing pages
 */
export interface BlogMetadata {
    title: string
    excerpt: string
    date: string
    slug: string
    topic: string
    image?: string
    tags?: string[]
    author?: string
}

/**
 * Get all blog posts metadata (without full content for performance)
 */
export function getAllBlogMetadata(): BlogMetadata[] {
    if (!fs.existsSync(ROOT)) return []

    const topics = fs.readdirSync(ROOT)
    const allPosts: BlogMetadata[] = []

    for (const topic of topics) {
        const topicPath = path.join(ROOT, topic)
        if (!fs.statSync(topicPath).isDirectory()) continue

        const files = fs.readdirSync(topicPath)

        for (const file of files) {
            if (!file.endsWith(".md")) continue

            const slug = file.replace(".md", "")
            const filePath = path.join(topicPath, file)
            const fileContent = fs.readFileSync(filePath, "utf-8")
            const { data } = matter(fileContent)

            allPosts.push({
                title: data.title || slug,
                excerpt: data.excerpt || data.description || "",
                date: data.date || "",
                slug,
                topic,
                image: data.image,
                tags: data.tags || [],
                author: data.author
            })
        }
    }

    // Sort by date descending (newest first)
    return allPosts.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA
    })
}
