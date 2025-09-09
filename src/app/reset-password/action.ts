"use server";

import { createClient } from "@sb/client";
import { Creds } from "./page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function resetPassword({
  confirmPassword,
  password,
  uid,
}: Creds & { uid: string }) {
  if (password !== confirmPassword) return "Passwords do not match";

  const supabase = await createClient();
  const cookieStore = await cookies();

  await supabase.auth.admin.updateUserById(uid, { password });
  cookieStore.delete("forgotPasswordRedirected");
  redirect("/login");
}
