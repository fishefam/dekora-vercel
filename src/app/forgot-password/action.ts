"use server";

import { createClient } from "@sb/client";
import { Creds } from "./page";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function forgotPassword({ email }: Creds) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const supabaseTask = createClient();
  const cookieStoreTask = cookies();
  const jwtTask = new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);
  const [supabase, cookieStore, jwt] = await Promise.all([
    supabaseTask,
    cookieStoreTask,
    jwtTask,
  ]);
  const { data } = await supabase.rpc("get_user_id_by_email", { email });
  const { id } = data?.at(0) ?? {};

  if (!id) return "User not found";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.BASE_URL + "/reset-password?uid=" + id,
  });

  if (error?.message)
    return "Something wrong with our server. Please try again later.";

  cookieStore.set("forgotPasswordRedirected", jwt, {
    httpOnly: true,
    sameSite: true,
    secure: true,
    path: "/",
  });
}
