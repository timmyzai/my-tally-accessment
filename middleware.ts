import { NextRequest, NextResponse } from "next/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes, except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session");
    if (!session?.value || !UUID_PATTERN.test(session.value)) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
