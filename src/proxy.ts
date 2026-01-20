import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // ✅ IMPORTANT: never redirect API routes to HTML login pages
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow login page itself
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const authed = req.cookies.get("krotus_auth")?.value === "1";
  if (authed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
