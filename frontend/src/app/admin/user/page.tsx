import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function AdminUserLegacyPage() {
  redirect(ROUTES.ADMIN.USERS);
}
