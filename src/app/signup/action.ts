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

const errors = {
  passwordMismatch: "Passwords do not match",
  weakPassword:
    "Password must be at least 8 characters long and include a number and a special character",
  unknown: "Error creating user",
};

export async function signup({
  confirmPassword,
  email,
  firstName,
  lastName,
  password,
}: Credentials) {
  if (password !== confirmPassword) return errors.passwordMismatch;
  if (password.length < 8 || !/[0-9]/g.test(password) || !/[^A-Za-z0-9]/g.test(password)) return errors.weakPassword;

  const client = await createClient();
  const result = await client.auth.admin.createUser({
    email,
    password,
    user_metadata: { firstName, lastName },
    email_confirm: true,
  });

  if (!result.data.user) return errors.unknown;

  redirect("/login");
}
