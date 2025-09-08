"use server";

import { createClient } from "@sb/client";
import { Creds } from "./page";

export async function forgotPassword({ email }: Creds) {
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error?.message) throw error;
  } catch {
    return "Something wrong with our server. Please try again later.";
  }
}
