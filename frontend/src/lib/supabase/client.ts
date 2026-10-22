import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

const DEFAULT_SUPABASE_URL = "https://placeholder-project.supabase.co";
const DEFAULT_SUPABASE_KEY = "placeholder-anon-key";

/**
 * Singleton Supabase client cho Browser / Client Components.
 * Tránh việc tạo mới client liên tục gây lệch session, rò rỉ bộ nhớ hoặc mất đồng bộ Auth state.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return browserClient;
}