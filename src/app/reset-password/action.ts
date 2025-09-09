"use server";

import { createClient } from "@sb/client";
import { Creds } from "./page";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

export async function resetPassword({ confirmPassword, password }: Creds) {
  if (password !== confirmPassword) return "Passwords do not match";

  const supabase = await createClient();
  const cookieStore = await cookies();
  const jwt = cookieStore.get("forgotPasswordRedirected")?.value ?? "";
  let email = "";

  try {
    const { payload } = await jwtVerify<{ email: string }>(
      jwt,
      new TextEncoder().encode(process.env.JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    email = payload.email;
  } catch {}

  const { data } = await supabase.rpc("get_user_id_by_email", { email });
  const { id } = data?.at(0) ?? {};

  if (!id) return "User not found";

  await supabase.auth.admin.updateUserById(id, { password });
  cookieStore.delete("forgotPasswordRedirected");
  redirect("/login");
}
