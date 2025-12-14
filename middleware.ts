import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Створюємо відповідь
  const response = NextResponse.next();
  
  // 🔥 ДОДАЄМО ЦЕЙ РЯДОК: записуємо поточний шлях у заголовок
  response.headers.set('x-current-path', pathname);

  // 1. Публічні шляхи (Login, No-access, API, і т.д.)
  if (
    pathname === "/login" ||
    pathname === "/no-access" || // <-- Переконайтесь, що це тут є
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return response; // Повертаємо response з нашим заголовком
  }

  // 2. Перевірка токена
  const sessionToken = request.cookies.get("better-auth.session_token") || 
                       request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};