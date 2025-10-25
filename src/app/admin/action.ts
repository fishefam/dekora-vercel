"use server";

import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Replace this with your existing server-side helper if you have one
 * that uses the SERVICE ROLE key (required for .auth.admin.*).
 */
function getAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SECRET_KEY!;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE env vars");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/* ------------------------- Types returned to UI ------------------------- */

export type AdminUserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  banned_until: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    status: string | null;
    avatar_url: string | null;
    updated_at: string | null;
    last_active_at: string | null;
  } | null;
};

type ListInput = {
  page?: number; // 1-based
  perPage?: number; // 1..1000
  query?: string; // optional fuzzy filter
};

type ListResult = {
  users: AdminUserRow[];
  page: number;
  perPage: number;
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/* ------------------------------ Utilities ------------------------------ */

function mapAuthUser(u: any): AdminUserRow {
  return {
    id: u?.id,
    email: u?.email ?? null,
    phone: u?.phone ?? null,
    created_at: u?.created_at ?? null,
    last_sign_in_at: u?.last_sign_in_at ?? null,
    banned_until: u?.banned_until ?? null,
    app_metadata: u?.app_metadata ?? null,
    user_metadata: u?.user_metadata ?? null,
    profile: null,
  };
}

/* -------------------------------- Actions ------------------------------ */

/**
 * List users (paged) from auth.users and join profiles by id.
 * Server-only; requires service role key.
 */
export async function listUsersAction(
  input: ListInput = {}
): Promise<Result<ListResult>> {
  try {
    const page = Math.max(1, Math.floor(input.page ?? 1));
    const perPage = Math.min(
      1000,
      Math.max(1, Math.floor(input.perPage ?? 25))
    );
    const q = (input.query ?? "").trim().toLowerCase();

    const supabase = getAdminClient();

    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) return { ok: false, error: error.message };

    const authUsers = (data?.users ?? []).map(mapAuthUser);

    // hydrate profiles in one round-trip
    const ids = authUsers.map((u) => u.id);
    if (ids.length > 0) {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, role, status, avatar_url, updated_at, last_active_at"
        )
        .in("id", ids);

      if (!pErr && profiles) {
        const byId = new Map(profiles.map((p: any) => [p.id, p]));
        for (const u of authUsers) u.profile = byId.get(u.id) ?? null;
      }
      // if pErr, we silently skip profiles to keep the list working
    }

    // optional fuzzy filter (email/id/full_name/profile.email)
    const filtered = q
      ? authUsers.filter(
          (u) =>
            (u.email ?? "").toLowerCase().includes(q) ||
            (u.id ?? "").toLowerCase().includes(q) ||
            (u.profile?.full_name ?? "").toLowerCase().includes(q) ||
            (u.profile?.email ?? "").toLowerCase().includes(q)
        )
      : authUsers;

    return { ok: true, data: { users: filtered, page, perPage } };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to list users" };
  }
}

/**
 * Get a single user by id (+profile).
 */
export async function getUserAction(id: string): Promise<Result<AdminUserRow>> {
  try {
    if (!id) return { ok: false, error: "Missing user id" };
    const supabase = getAdminClient();

    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error) return { ok: false, error: error.message };
    if (!data?.user) return { ok: false, error: "User not found" };

    const row = mapAuthUser(data.user);

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, status, avatar_url, updated_at, last_active_at"
      )
      .eq("id", id)
      .maybeSingle();

    row.profile = profile ?? null;

    return { ok: true, data: row };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to get user" };
  }
}

/* ---------------------- create user server action ------------------ */

export async function createUserAction(input: {
  email: string;
  full_name?: string;
  role?: string;
  password?: string;
}): Promise<Result<AdminUserRow>> {
  try {
    if (!input?.email) return { ok: false, error: "Missing email" };

    const supabase = getAdminClient();

    // generate a temporary secure-ish password when not provided
    const password =
      input.password ??
      "Tmp!" +
        Math.random().toString(36).slice(2, 10) +
        Math.random().toString(36).toUpperCase().slice(2, 6);

    // create user via admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: input.email,
      password,
      user_metadata: { role: input.role ?? "user" },
      email_confirm: true,
    });

    if (error) return { ok: false, error: error.message };
    const user = (data as any)?.user;
    if (!user) return { ok: false, error: "Failed to create user" };

    // upsert profile row (id == auth user id)
    const profileRow = {
      id: user.id,
      full_name: input.full_name ?? null,
      email: input.email,
      role: input.role ?? "user",
      status: "Active",
      avatar_url: null,
    };

    // ignore profile error — best-effort
    await supabase.from("profiles").upsert(profileRow);

    const row = mapAuthUser(user);
    row.profile = profileRow as any;

    return { ok: true, data: row };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to create user" };
  }
}

/* ---------------------- update user / role / suspend / delete ------------------ */

/**
 * Update auth user (email/phone/user_metadata) and profile fields.
 */
export async function updateUserAction(input: {
  id: string;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  status?: string | null;
}): Promise<Result<AdminUserRow>> {
  try {
    if (!input?.id) return { ok: false, error: "Missing user id" };
    const supabase = getAdminClient();

    // update auth user (email/phone) and preserve/merge user_metadata
    const authUpdate: any = {};
    if (typeof input.email !== "undefined") authUpdate.email = input.email;
    if (typeof input.phone !== "undefined") authUpdate.phone = input.phone;

    if (Object.keys(authUpdate).length > 0) {
      const { error } = await supabase.auth.admin.updateUserById(
        input.id,
        authUpdate
      );
      if (error) return { ok: false, error: error.message };
      // continue — we'll fetch profile below
    }

    // upsert profile row with provided fields
    const profileRow: any = { id: input.id };
    if (typeof input.full_name !== "undefined") profileRow.full_name = input.full_name;
    if (typeof input.avatar_url !== "undefined") profileRow.avatar_url = input.avatar_url;
    if (typeof input.status !== "undefined") profileRow.status = input.status;

    if (Object.keys(profileRow).length > 1) {
      const { error: pErr } = await supabase.from("profiles").upsert(profileRow);
      if (pErr) {
        // best-effort, don't fail entire operation on profile error
        console.error("profile upsert failed", pErr);
      }
    }

    // return fresh user row
    return await getUserAction(input.id);
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to update user" };
  }
}

/**
 * Change a user's role (auth.user_metadata + profiles.role)
 */
export async function changeRoleAction(input: {
  id: string;
  role: string;
}): Promise<Result<AdminUserRow>> {
  try {
    if (!input?.id) return { ok: false, error: "Missing user id" };
    if (!input?.role) return { ok: false, error: "Missing role" };
    const supabase = getAdminClient();

    // update auth user metadata
    const { error } = await supabase.auth.admin.updateUserById(input.id, {
      user_metadata: { role: input.role },
    });
    if (error) return { ok: false, error: error.message };

    // update profiles table role
    const { error: pErr } = await supabase
      .from("profiles")
      .upsert({ id: input.id, role: input.role }, { returning: "minimal" });
    if (pErr) {
      // don't fail hard if profile update errors
      console.error("profile role upsert failed", pErr);
    }

    return await getUserAction(input.id);
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to change role" };
  }
}

/**
 * Suspend a user by setting banned_until (ISO string). If until is omitted
 * set a default suspension (30 days).
 */
export async function suspendUserAction(input: {
  id: string;
  until?: string | null;
}): Promise<Result<AdminUserRow>> {
  try {
    if (!input?.id) return { ok: false, error: "Missing user id" };
    const supabase = getAdminClient();

    const untilIso =
      typeof input.until === "string" && input.until
        ? input.until
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // 30 days

    const { error } = await supabase.auth.admin.updateUserById(input.id, {
      banned_until: untilIso,
    } as any);
    if (error) return { ok: false, error: error.message };

    return await getUserAction(input.id);
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to suspend user" };
  }
}

/**
 * Activate / unsuspend a user by clearing banned_until.
 */
export async function activateUserAction(id: string): Promise<Result<AdminUserRow>> {
  try {
    if (!id) return { ok: false, error: "Missing user id" };
    const supabase = getAdminClient();

    const { error } = await supabase.auth.admin.updateUserById(id, {
      banned_until: null,
    } as any);
    if (error) return { ok: false, error: error.message };

    return await getUserAction(id);
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to activate user" };
  }
}

/**
 * Delete a user (auth + profile)
 */
export async function deleteUserAction(id: string): Promise<Result<null>> {
  try {
    if (!id) return { ok: false, error: "Missing user id" };
    const supabase = getAdminClient();

    // delete from auth
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return { ok: false, error: error.message };

    // best-effort: remove profile row
    const { error: pErr } = await supabase.from("profiles").delete().eq("id", id);
    if (pErr) console.error("failed to delete profile", pErr);

    return { ok: true, data: null };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to delete user" };
  }
}
