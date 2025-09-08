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

export async function signupAction(credentials: Credentials) {
  const client = await createClient();
  const result = await client.auth.admin.createUser({
    ...credentials,
    email_confirm: true,
  });

  console.log(result.error);

  if (credentials.password !== credentials.confirmPassword)
    return "Passwords do not match";
  if (credentials.password.length < 8)
    return "Password must be at least 8 characters long and include a number and a special character";
  if (!result.data.user) return "Error creating user";

  await client.auth.admin.updateUserById(result.data.user?.id, {
    email_confirm: true,
  });

  redirect("/login");
}
