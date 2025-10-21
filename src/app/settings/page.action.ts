"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@sb/client";
import { getUserIdFromCookie } from "@sb/auth";

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
export async function setCardStyleAction(
  style: "standard" | "rounded" | "elevated"
) {
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

// Returns latest names from Supabase Auth (raw_user_meta_data > user_metadata fallback)
export async function getAccountNamesAction(): Promise<{
  firstName: string;
  lastName: string;
  email: string | null;
}> {
  const supabase = await createClient();
  const id = await getUserIdFromCookie();
  const { data, error } = await supabase.auth.admin.getUserById(id ?? "");
  if (error || !data?.user) {
    return { firstName: "", lastName: "", email: null };
  }

  const u = data.user as any;
  const raw = u.raw_user_meta_data ?? {};
  const meta = u.user_metadata ?? {};

  const firstName =
    raw.firstName ?? raw.first_name ?? meta.firstName ?? meta.first_name ?? "";
  const lastName =
    raw.lastName ?? raw.last_name ?? meta.lastName ?? meta.last_name ?? "";

  return { firstName, lastName, email: data.user.email ?? null };
}

export async function updateAccountNamesAction(
  firstName: string,
  lastName: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const id = await getUserIdFromCookie();
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(id ?? "");

    if (userError || !userData?.user) {
      return { ok: false, message: "User not authenticated." };
    }

    // ✅ Update auth user's metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      id ?? "",
      {
        user_metadata: { firstName, lastName },
      }
    );

    if (updateError) {
      console.error("Update user metadata error:", updateError);
      return { ok: false, message: "Failed to update account details." };
    }

    // Optional: revalidate settings page cache so UI updates
    revalidatePath("/settings");

    return { ok: true, message: "Account details updated successfully." };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { ok: false, message: "Something went wrong." };
  }
}
