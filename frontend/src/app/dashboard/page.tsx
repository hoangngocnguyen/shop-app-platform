import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>

      <LogoutButton></LogoutButton>
    </main>
  );
}