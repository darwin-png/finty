import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // SuperAdmin: solo puede acceder a /app/superadmin
    if (token?.role === "SUPERADMIN" && !pathname.startsWith("/app/superadmin")) {
      return NextResponse.redirect(new URL("/app/superadmin", req.url));
    }

    // Proteger rutas superadmin — solo SUPERADMIN
    if (pathname.startsWith("/app/superadmin") && token?.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/app/dashboard", req.url));
    }

    // Proteger rutas admin — solo ADMINISTRADOR
    if (pathname.startsWith("/app/admin") && token?.role !== "ADMINISTRADOR") {
      return NextResponse.redirect(new URL("/app/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/app/:path*",
    "/api/((?!auth|forgot-password|debug-email).*)",  // Removed 'register' - now requires auth
  ],
};
