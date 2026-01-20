import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.SITE_PASSWORD;

  if (!expected) {
    return NextResponse.json({ ok: false, error: "Missing SITE_PASSWORD" }, { status: 500 });
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("krotus_auth", "1", {
    httpOnly: true,
    secure: isProd,          // ✅ only secure in prod
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
