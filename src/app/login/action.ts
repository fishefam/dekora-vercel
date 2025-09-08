"use server";

import { createClient } from "@sb/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Creds } from "./page";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function login({ email, password, remember }: Creds) {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const cookieStore = await cookies();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const jwt = await new SignJWT({ uid: data.user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(secret);
  cookieStore.set("auth", jwt, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: remember ? 100000 : undefined,
  });

  revalidatePath("/", "layout");
  redirect("/");
}
