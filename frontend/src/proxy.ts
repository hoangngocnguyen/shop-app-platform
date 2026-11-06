import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { ROUTES } from '@/constants/routes';

/**
 * File proxy.ts chuẩn chính thức từ Next.js 16+ (Thay thế cho middleware.ts cũ).
 * Chạy ở tầng Edge/Network Boundary để kiểm tra quyền truy cập trước khi request chạm vào Server/Page.
 * 
 * Tối ưu hiệu năng:
 * - Không gọi network tới Supabase Auth trên các route public (giảm ~500ms - 1200ms latency mỗi page load).
 * - Kiểm tra cookie cục bộ trước khi quyết định gọi Supabase Auth trên protected routes.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname.startsWith(ROUTES.AUTH.LOGIN) ||
    pathname.startsWith(ROUTES.AUTH.REGISTER);

  // Các route yêu cầu đăng nhập (bắt đầu bằng /user hoặc /admin)
  const isProtectedRoute =
    pathname.startsWith('/user') || pathname.startsWith('/admin');

  // Kiểm tra xem trình duyệt có cookie Supabase auth nào không
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && (c.name.includes('-auth-token') || c.name.includes('access-token')));

  // Trường hợp 1: Route public thông thường -> Trả về ngay lập tức, không tốn network roundtrip
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Trường hợp 2: Route bảo vệ (/admin, /user) nhưng không có cookie auth -> Chuyển hướng ngay tới login (0ms)
  if (isProtectedRoute && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.AUTH.LOGIN;
    return NextResponse.redirect(url);
  }

  // Trường hợp 3: Route auth (/login, /register) và không có cookie -> Cho phép vào ngay (0ms)
  if (isAuthRoute && !hasAuthCookie) {
    return NextResponse.next();
  }

  // Khởi tạo Supabase client chỉ khi thực sự cần xác thực token
  const { supabase, response } = createClient(request);

  if (!supabase) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.AUTH.LOGIN;
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Xác thực user với Supabase Auth
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  // Chưa đăng nhập mà cố tình vào trang bảo vệ -> redirect /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.AUTH.LOGIN;

    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value));
    return redirectResponse;
  }

  // Đã đăng nhập mà cố tình vào /login hoặc /register -> redirect /
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
