import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth";

/**
 * POST /api/scraper/trigger
 * Sends a trigger request to the Railway scraper microservice.
 * Body: { jobType: "discover" | "validate", storeSlugs?: string[] }
 */
export async function POST(request) {
  if (process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED !== "true") {
    return NextResponse.json(
      { error: "AI features are currently disabled via configuration toggle." },
      { status: 503 }
    );
  }

  const access = await requirePermission("scraper");
  if (access.error) return access.error;

  const scraperUrl = process.env.SCRAPER_SERVICE_URL;
  const scraperSecret = process.env.SCRAPER_INTERNAL_SECRET;

  if (!scraperUrl) {
    return NextResponse.json(
      { error: "SCRAPER_SERVICE_URL is not set. Deploy the scraper service to Railway first." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const jobType = body.jobType || "discover";
    const storeSlugs = body.storeSlugs || null;
    const forceAll = body.forceAll || false;

    const response = await fetch(`${scraperUrl}/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-scraper-secret": scraperSecret,
      },
      body: JSON.stringify({ jobType, storeSlugs, forceAll }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Scraper service returned ${response.status}: ${text}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not reach scraper service: ${err.message}` },
      { status: 502 }
    );
  }
}
