"use server";

import { createClient } from "@sb/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Creds } from "./page";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const errors = {
  wrongCred: "Wrong email or password",
  unknown: "Something wrong with our server. Please try again later.",
};

export async function login({ email, password, remember }: Creds) {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (
    error &&
    /Invalid login credentials/gi.test((error as Error | null)?.message ?? "")
  )
    return errors.wrongCred;

  if (
    error &&
    !/Invalid login credentials/gi.test((error as Error | null)?.message ?? "")
  )
    return errors.unknown;

  const cookieStore = await cookies();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const jwt = await new SignJWT({ uid: data.user!.id })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);
  cookieStore.set("auth", jwt, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: remember ? 60 * 60 * 24 * 365 : undefined,
  });

  revalidatePath("/", "layout");
  redirect("/");
}
