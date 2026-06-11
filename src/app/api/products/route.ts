import { NextResponse } from "next/server";
import productsData from "@/data/products.json";

// Serve products JSON via API so client components can fetch it
// instead of bundling the 2.3MB JSON into the client JS bundle.
// Aggressive cache headers since this is a static product catalog.
export async function GET() {
  return NextResponse.json(productsData, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "CDN-Cache-Control": "public, max-age=3600",
    },
  });
}

// Force static generation at build time
export const dynamic = "force-static";
