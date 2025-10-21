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


//
// 1️⃣ Theme Action — "light" | "dark" | "system"
//
export async function setThemeAction(theme: "light" | "dark" | "system") {
  if (!["light", "dark", "system"].includes(theme)) return;

  const c = await cookies();
  c.set("theme", theme, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

//
// 2️⃣ Card Style Action — "standard" | "rounded" | "elevated"
//
export async function setCardStyleAction(style: "standard" | "rounded" | "elevated") {
  if (!["standard", "rounded", "elevated"].includes(style)) return;

  const c = await cookies();
  c.set("card_style", style, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
}

//
// 3️⃣ Font Size Action — accepts any number between 12–24
//
export async function setFontSizeAction(size: number) {
  const safe = Math.min(Math.max(size, 12), 24);
  const c = await cookies();
  c.set("font_size", String(safe), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
}
