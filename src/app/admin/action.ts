"use server";

import { getUserIdFromCookie } from "@sb/auth";
import { createClient } from "@sb/client";

function adminClient() {
  return createClient();
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "Admin" | "Curator" | "User";
  status: "Active" | "Inactive" | "Suspended";
  lastActive: string | null;
  joined: string;
  decks: number;
};

export type UserFilters = {
  roles?: Array<"Admin" | "Curator" | "User">;
  statuses?: Array<"Active" | "Inactive" | "Suspended">;
  q?: string;
  page?: number;
  pageSize?: number;
};

/** -------- READS: use supabase.from(...) instead of raw SQL / exec_sql -------- */
export async function getUsersAction(filters: UserFilters = {}) {
  const currentUserId = await getUserIdFromCookie();
  if (!currentUserId)
    return { rows: [] as AdminUser[], total: 0, page: 1, pageSize: 10 };

  const supa = await adminClient();

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const roleMapDb: Record<AdminUser["role"], string> = {
    Admin: "admin",
    Curator: "curator",
    User: "user",
  };
  const statusMapDb: Record<AdminUser["status"], string> = {
    Active: "active",
    Inactive: "inactive",
    Suspended: "suspended",
  };

  const rolesDb = (filters.roles ?? []).map((r) => roleMapDb[r]);
  const statusesDb = (filters.statuses ?? []).map((s) => statusMapDb[s]);
  const q = (filters.q ?? "").trim().toLowerCase();

  // 1) Count query (exact count) with the same filters
  {
    let countQuery = supa
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (rolesDb.length) countQuery = countQuery.in("role", rolesDb);
    if (statusesDb.length) countQuery = countQuery.in("status", statusesDb);
    if (q)
      countQuery = countQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);

    const { count, error } = await countQuery;
    if (error) {
      console.error("profiles count error:", error);
      return { rows: [], total: 0, page, pageSize };
    }

    // 2) Page data query with same filters
    let dataQuery = supa
      .from("profiles")
      .select(
        "id, full_name, email, avatar_url, role, status, last_active_at, created_at"
      )
      .order("last_active_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to); // pagination

    if (rolesDb.length) dataQuery = dataQuery.in("role", rolesDb);
    if (statusesDb.length) dataQuery = dataQuery.in("status", statusesDb);
    if (q)
      dataQuery = dataQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);

    const { data: profs, error: dataErr } = await dataQuery;
    if (dataErr) {
      console.error("profiles data error:", dataErr);
      return { rows: [], total: count ?? 0, page, pageSize };
    }

    const ids = (profs ?? []).map((p) => p.id);
    let deckCountMap = new Map<string, number>();

    if (ids.length) {
      // 3) Fetch decks for *these users only* and count client-side
      const { data: decksRows, error: decksErr } = await supa
        .from("decks")
        .select("id,user_id")
        .in("user_id", ids);

      if (decksErr) {
        console.error("decks query error:", decksErr);
      } else {
        deckCountMap = decksRows!.reduce((m, r) => {
          m.set(r.user_id as string, (m.get(r.user_id as string) ?? 0) + 1);
          return m;
        }, new Map<string, number>());
      }
    }

    const rows: AdminUser[] = (profs ?? []).map((p) => ({
      id: p.id,
      name: (p.full_name as string) ?? "(no name)",
      email: p.email as string,
      avatar: (p.avatar_url as string) ?? null,
      role:
        p.role === "admin"
          ? "Admin"
          : p.role === "curator"
          ? "Curator"
          : "User",
      status:
        p.status === "active"
          ? "Active"
          : p.status === "inactive"
          ? "Inactive"
          : "Suspended",
      lastActive: p.last_active_at
        ? new Date(p.last_active_at as string)
            .toISOString()
            .replace(/:\d{2}\.\d{3}Z$/, "Z")
            .slice(0, 16)
            .replace("T", "T")
        : null,
      joined: new Date(p.created_at as string).toISOString().slice(0, 10),
      decks: deckCountMap.get(p.id) ?? 0,
    }));

    return { rows, total: count ?? 0, page, pageSize };
  }
}

/** -------- MUTATIONS: Supabase Admin API (unchanged) -------- */
export async function createUserAction(input: {
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "curator" | "admin";
}) {
  const caller = await getUserIdFromCookie();
  if (!caller) return { ok: false, error: "Not authenticated" };

  const supa = await adminClient();

  const full_name = `${(input.firstName ?? "").trim()} ${(
    input.lastName ?? ""
  ).trim()}`.trim();
  const email = (input.email ?? "").trim().toLowerCase();
  if (!full_name || !email)
    return { ok: false, error: "Name and email required" };

  const { data: created, error: authErr } = await supa.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name },
    app_metadata: { role: input.role },
  });
  if (authErr || !created?.user)
    return { ok: false, error: authErr?.message ?? "Failed to create user" };

  const authUserId = created.user.id;

  const { error: profErr } = await supa.from("profiles").upsert(
    {
      id: authUserId,
      full_name,
      email,
      role: input.role,
      status: "active",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (profErr) return { ok: false, error: profErr.message };

  return { ok: true, id: authUserId };
}

export async function updateUserRoleAction(
  userId: string,
  role: "user" | "curator" | "admin"
) {
  const caller = await getUserIdFromCookie();
  if (!caller) return { ok: false };

  const supa = await adminClient();
  const { error: profErr } = await supa
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (profErr) return { ok: false, error: profErr.message };

  await supa.auth.admin.updateUserById(userId, { app_metadata: { role } });
  return { ok: true };
}

export async function updateUserStatusAction(
  userId: string,
  status: "active" | "inactive" | "suspended"
) {
  const caller = await getUserIdFromCookie();
  if (!caller) return { ok: false };

  const supa = await adminClient();
  const { error: profErr } = await supa
    .from("profiles")
    .update({ status })
    .eq("id", userId);
  if (profErr) return { ok: false, error: profErr.message };

  await supa.auth.admin.updateUserById(userId, {
    app_metadata: { suspended: status === "suspended" },
  });
  return { ok: true };
}

export async function deleteUserAction(userId: string) {
  const caller = await getUserIdFromCookie();
  if (!caller) return { ok: false };

  const supa = await adminClient();
  const { error: delErr } = await supa.auth.admin.deleteUser(userId);
  if (delErr) return { ok: false, error: delErr.message };

  await supa.from("profiles").delete().eq("id", userId);
  return { ok: true };
}
