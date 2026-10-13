import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const getSession = cache(async () => auth());

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  return session.user;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "admin") redirect("/");
  return session.user;
}
