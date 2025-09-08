"use server";

import { redirect } from "next/navigation";
import { createClient } from "@sb/client";

export type Credentials = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
};

export async function signup({
  confirmPassword,
  email,
  firstName,
  lastName,
  password,
}: Credentials) {
  if (password !== confirmPassword) throw new Error("Passwords do not match");
  if (password.length < 8)
    return "Password must be at least 8 characters long and include a number and a special character";

  const client = await createClient();
  const result = await client.auth.admin.createUser({
    email,
    password,
    user_metadata: { firstName, lastName },
    email_confirm: true,
  });

  if (!result.data.user) return "Error creating user";

  redirect("/login");
}
