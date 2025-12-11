export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/Dashboard", "/ProductCreator"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/Dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/Dashboard", "/ProductCreator"],
};
