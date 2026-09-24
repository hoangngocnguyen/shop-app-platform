import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { ROUTES } from '@/constants/routes';

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session & lấy user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith(ROUTES.AUTH.LOGIN) ||
    pathname.startsWith(ROUTES.AUTH.REGISTER);

  // Chưa đăng nhập -> Chuyển về /login khi truy cập trang bảo mật
  if (!user && !isAuthRoute && pathname !== ROUTES.HOME) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.AUTH.LOGIN;
    return NextResponse.redirect(url);
  }

  // Đã đăng nhập -> Chuyển về / khi cố vào /login hoặc /register
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.HOME;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};