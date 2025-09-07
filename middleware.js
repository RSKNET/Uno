import { NextResponse } from "next/server";

const EXCLUDED_PAGES = ["/", "/GamePage", "/maintenance", "/NoTournamentSetup"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (EXCLUDED_PAGES.includes(pathname)) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)",
  ],
};
