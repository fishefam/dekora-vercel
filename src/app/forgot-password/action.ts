"use server";

import { createClient } from "@sb/client";
import { Creds } from "./page";

export async function forgotPassword({ email }: Creds) {
  const supabase = await createClient();
  supabase.auth.resetPasswordForEmail(email);
}
