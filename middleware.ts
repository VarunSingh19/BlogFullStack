import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  // Check if the path requires authentication
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin")
  const isApiPath = request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.startsWith("/api/auth")

  if ((isAdminPath || isApiPath) && !token) {
    // Redirect to login if no token is present
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // For admin paths, verify that the user is an admin
  if (isAdminPath && token) {
    try {
      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret")
      const { payload } = await jwtVerify(token, secret)

      // Check if the user is an admin
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      // If token verification fails, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
