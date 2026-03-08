import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/family-members";

const isPublicRoute = (pathname: string) => /^\/sign-in(\/.*)?$/.test(pathname);
const isAuthApiRoute = (pathname: string) => pathname.startsWith("/api/auth");
const isDiscoveryRoute = (pathname: string) => pathname === "/discovery";

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

  // POST /discovery: rewrite to API so clients that post to page path still work
  if (pathname === "/discovery" && req.method === "POST") {
    return NextResponse.rewrite(new URL("/api/discovery/complete", req.url));
  }

  // First-time gate: redirect to discovery if not completed
  if (!isDiscoveryRoute(pathname)) {
    const discoveryCompleted = req.cookies.get("discovery_completed")?.value;
    if (!discoveryCompleted || discoveryCompleted !== "1") {
      return NextResponse.redirect(new URL("/discovery", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
