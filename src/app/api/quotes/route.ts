import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const authed = (await cookies()).get("krotus_auth")?.value === "1";
  if (!authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.CONVEX_API_SECRET;
  const upstreamBase = process.env.CONVEX_QUOTES_URL;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Missing CONVEX_API_SECRET" },
      { status: 500 }
    );
  }

  if (!upstreamBase) {
    return NextResponse.json(
      { ok: false, error: "Missing CONVEX_QUOTES_URL" },
      { status: 500 }
    );
  }

  // Pass through query params like ?limit=20
  const incoming = new URL(req.url);
  const upstream = new URL(upstreamBase);
  incoming.searchParams.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });

  const res = await fetch(upstream.toString(), {
    headers: {
      "x-krotus-secret": secret,
    },
    // You can also use next: { revalidate: 10 } here, but simplest:
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: `Upstream error: ${res.status}`, detail: text },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
