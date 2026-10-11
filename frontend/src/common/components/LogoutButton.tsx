import { useAuthStore } from "@/features/auth";

export function LogoutButton() {
  const {logout} = useAuthStore();
  return (
    <form action={logout}>
      <button type="submit">
        Logout
      </button>
    </form>
  );
}