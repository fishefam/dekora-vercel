"use server";

import { createClient } from "@sb/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
