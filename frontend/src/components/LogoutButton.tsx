import { logout } from "@/app/auth/logout/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit">
        Logout
      </button>
    </form>
  );
}