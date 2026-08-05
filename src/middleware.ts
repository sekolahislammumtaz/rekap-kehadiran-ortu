import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "simumtaz_default_secret_key_rekap_kajian_2026"
);
const COOKIE_NAME = "admin_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/sample-excel") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      isAuthenticated = !!verified.payload.username;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect to /login if unauthenticated
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect root to /dashboard if authenticated
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
