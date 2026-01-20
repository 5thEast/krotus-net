import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Require site login cookie (same as quotes)
  const cookieStore = await cookies();
  const authed = cookieStore.get("krotus_auth")?.value === "1";
  if (!authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const convexBase = process.env.CONVEX_BASE_URL; // e.g. https://giddy-gazelle-339.convex.site
  const secret = process.env.CONVEX_API_SECRET;

  if (!convexBase) {
    return NextResponse.json({ ok: false, error: "Missing CONVEX_BASE_URL" }, { status: 500 });
  }
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing CONVEX_API_SECRET" }, { status: 500 });
  }

  // NOTE: this calls your Convex HTTP endpoint (you'll add it below)
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit") ?? "20";

  const upstream = `${convexBase}/leaderboard/top?limit=${encodeURIComponent(limit)}`;

  const res = await fetch(upstream, {
    headers: { "x-krotus-secret": secret },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
