"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type Result = { ok: true; message: string } | { ok: false; message: string };

export async function setDefaultReviewTabAction(
  value: string
): Promise<Result> {
  const allowed = new Set(["cards", "quiz"]);
  const c = await cookies();
  if (!allowed.has(value)) {
    return { ok: false, message: "Invalid review tab option." };
  }

  // Persist as a cookie (no schema change required)
  c.set("default_review_tab", value, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  // If this runs from /settings, revalidate it; change the path if used elsewhere
  revalidatePath("/settings");

  return { ok: true, message: "Default review tab saved." };
}
