"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
  revalidatePath("/", "layout");
  redirect("/login");
}
