"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut({
    scope: "local",
  });

  revalidatePath("/", "layout");

  redirect(ROUTES.AUTH.LOGIN);
}