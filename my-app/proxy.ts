import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);

// The real app routes (not "/dashboard"/"/profile"/"/settings" — those don't
// exist here; the settings page is "/setting", singular).
const PROTECTED_ROUTES = ["/home", "/discover", "/library", "/history", "/setting", "/article"];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const signedIn = await hasValidSession(req);

  // "/" is the onboarding/sign-in flow — skip it for already-authenticated users
  if (pathname === "/") {
    return signedIn ? NextResponse.redirect(new URL("/home", req.url)) : NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (!isProtected) return NextResponse.next();

  if (!signedIn) {
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("auth_token"); // clears a stale/invalid token, if any
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/discover/:path*",
    "/library/:path*",
    "/history/:path*",
    "/setting/:path*",
    "/article/:path*",
  ],
};