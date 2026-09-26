import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { ROUTES } from '@/constants/routes';

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Lấy thông tin user an toàn qua getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  const isAuthRoute =
    pathname.startsWith(ROUTES.AUTH.LOGIN) ||
    pathname.startsWith(ROUTES.AUTH.REGISTER);

  // 1. Chưa đăng nhập mà truy cập trang bảo mật -> Chuyển hướng về /login
  if (!user && !isAuthRoute && pathname !== ROUTES.HOME) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.AUTH.LOGIN;

    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value));
    return redirectResponse;
  }

  // 2. Đã đăng nhập mà cố tình vào /login hoặc /register -> Chuyển hướng về trang chủ /
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.HOME;

    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};