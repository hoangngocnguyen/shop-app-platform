import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { ROUTES } from '@/constants/routes';

/**
 * Middleware chuẩn của Next.js App Router.
 * Chạy ở tầng Edge Runtime để kiểm tra quyền truy cập trước khi request chạm vào Server/Page.
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Lấy thông tin user an toàn qua getUser() từ Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  const isAuthRoute =
    pathname.startsWith(ROUTES.AUTH.LOGIN) ||
    pathname.startsWith(ROUTES.AUTH.REGISTER);

  const isProtectedRoute = pathname.startsWith('/user');

  // 1. Chưa đăng nhập mà cố tình truy cập trang bảo vệ (/user/...) -> Chuyển hướng về /login
  if (!user && isProtectedRoute) {
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
    // Bỏ qua các file tĩnh, hình ảnh, favicon
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
