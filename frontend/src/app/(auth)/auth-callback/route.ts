import { createClient } from "@/lib/supabase/server";
import { syncUser } from "@/features/auth/api/auth";
import { NextResponse } from "next/server";
import { ROUTES } from "@/constants/routes";

/**
 * Sanitize giá trị `next` từ query string để chặn open redirect.
 * Chỉ cần đảm bảo path ở lại cùng origin:
 * - Decode trước để bắt bypass kiểu %2F%2F
 * - Phải bắt đầu bằng "/" nhưng KHÔNG được bắt đầu bằng "//" (protocol-relative URL)
 */
function sanitizeNextPath(raw: string | null): string {
  if (!raw) return "/";

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return "/";
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/";

  return decoded;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session?.access_token) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, origin);
    loginUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(loginUrl.toString());
  }

  try {
    await syncUser(data.session.access_token);
  } catch {
    await supabase.auth.signOut();
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, origin);
    loginUrl.searchParams.set("error", "sync_failed");
    return NextResponse.redirect(loginUrl.toString());
  }

  return NextResponse.redirect(`${origin}${next}`);
}

