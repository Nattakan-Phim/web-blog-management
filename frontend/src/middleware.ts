import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth?.user && !!req.auth.accessToken;
  const isLoginPage = pathname === "/admin/login";

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/blogs", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
