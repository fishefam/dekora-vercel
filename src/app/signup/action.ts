"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/client";

export type Credentials = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
};

export async function signupAction(credentials: Credentials) {
  const client = await createClient();
  const result = await client.auth.admin.createUser({
    ...credentials,
    email_confirm: true,
  });
  if (credentials.password !== credentials.confirmPassword)
    return "Passwords do not match";
  if (credentials.password.length < 8)
    return "Password must be at least 8 characters long and include a number and a special character";
  if (!result.data.user) return "Error creating user";
  redirect("/login");
}
