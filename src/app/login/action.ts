"use server";

import { createClient } from "@sb/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Creds } from "./page";

export async function login({ email, password, remember }: Creds) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
