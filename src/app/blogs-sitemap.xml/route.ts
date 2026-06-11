import { getAllBlogRoutes } from "@/lib/blog";


export const dynamic = 'force-static';

export async function GET() {
    const routes = getAllBlogRoutes();
    const domain = "https://huzi.pk";

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
            .map((route) => {
                return `
    <url>
      <loc>${domain}/blog/${route.topic}/${route.slug}</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    </url>`;
            })
            .join("")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
