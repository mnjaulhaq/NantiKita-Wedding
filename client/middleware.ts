import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Harus SAMA PERSIS dengan JWT_SECRET di project server/, karena token
// diterbitkan oleh server tapi diverifikasi di sini (client tidak bisa akses DB).
const SECRET = process.env.JWT_SECRET;

function hasValidSession(req: NextRequest) {
  const token = req.cookies.get("nk_token")?.value;
  if (!token || !SECRET) return false; // tanpa secret => anggap tidak login (fail closed)
  try {
    jwt.verify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const loggedIn = hasValidSession(req);

  // URL lama diarahkan ke URL khusus owner agar route register tidak tampil di login.
  if (pathname === "/register-admin") {
    return NextResponse.redirect(new URL("/register-owner", req.url));
  }

  // Rute admin wajib login, setara middleware('auth') di Laravel.
  // if (pathname.startsWith("/admin") && !loggedIn) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  // Rute guest (login/register/verify-otp) tidak boleh diakses kalau sudah login.
  const guestPaths = ["/login", "/register-owner", "/register-admin"];
  if (guestPaths.includes(pathname) && loggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register-admin", "/register-owner"],
};
