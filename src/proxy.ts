import { NextRequest, NextResponse } from "next/server";

// /app altındaki her şeyi koru. Oturum yoksa login'e yönlendir.
export default function proxy(req: NextRequest) {
  const session = req.cookies.get("fos_session")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/app")) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  // Güvenlik başlıkları (canlı için)
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  return res;
}

export const config = {
  matcher: ["/app/:path*", "/login", "/"],
};
