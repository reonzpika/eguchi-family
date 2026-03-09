import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/family-members";

const isPublicRoute = (pathname: string) => /^\/sign-in(\/.*)?$/.test(pathname);
const isAuthApiRoute = (pathname: string) => pathname.startsWith("/api/auth");

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isPublicRoute(pathname) || isAuthApiRoute(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/admin")) {
    const memberId = token.member_id as string | undefined;
    if (!memberId || !isAdmin(memberId)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Discovery is optional and lives in Settings; old /discovery URL redirects there
  if (pathname === "/discovery") {
    return NextResponse.redirect(new URL("/settings", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
