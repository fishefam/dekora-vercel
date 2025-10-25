"use server";

import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin/client helper (SERVICE ROLE not strictly required
 * for these queries but keep same pattern).
 */
function getAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY!;
  if (!url || !key) throw new Error("Missing SUPABASE env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

/* Types */
export type DeckRow = {
  id: string;
  name: string | null;
  description: string | null;
  user_id: string | null;
  category_id: string | null;
  is_public: boolean | null;
  is_archived: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  last_studied_at: string | null;
  study_count: number | null;
  category?: { id: string; name?: string | null } | null;
  creator?: {
    id: string;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  flashcards_count?: number;
  reported?: boolean;
};

type ListInput = {
  page?: number;
  perPage?: number;
  query?: string;
  status?: "published" | "review" | "blocked" | "reported";
};

type ListResult = { decks: DeckRow[]; page: number; perPage: number };
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/* Helpers */
function ensureIds(arr: any[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

/* Actions */

/**
 * List decks with optional filters and hydration (category, creator, flashcard counts).
 * status:
 *  - published => is_public = true AND is_archived = false
 *  - review    => is_public = false AND is_archived = false
 *  - blocked   => is_archived = true
 *  - reported  => requires a `deck_reports` table; if none exists, returns none
 */
export async function listDecksAction(
  input: ListInput = {}
): Promise<Result<ListResult>> {
  try {
    const page = Math.max(1, Math.floor(input.page ?? 1));
    const perPage = Math.min(
      1000,
      Math.max(1, Math.floor(input.perPage ?? 50))
    );
    const q = (input.query ?? "").trim().toLowerCase();
    const status = input.status;

    const supabase = getAdminClient();

    // base query
    let qb = supabase
      .from("decks")
      .select(
        "id, name, description, user_id, category_id, is_public, is_archived, created_at, updated_at, last_studied_at, study_count",
        { count: "estimated" }
      );

    // apply status filters
    if (status === "published") {
      qb = qb.eq("is_public", true).eq("is_archived", false);
    } else if (status === "review") {
      qb = qb.eq("is_public", false).eq("is_archived", false);
    } else if (status === "blocked") {
      qb = qb.eq("is_archived", true);
    } else if (status === "reported") {
      // handled below
    }

    // simple search on name/description
    if (q) {
      qb = qb.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    qb = qb.range(from, to).order("updated_at", { ascending: false });

    const { data: decksRows, error } = await qb;
    if (error) return { ok: false, error: error.message };

    const decks = (decksRows ?? []) as DeckRow[];
    if (decks.length === 0)
      return { ok: true, data: { decks: [], page, perPage } };

    // collect ids for hydration
    const deckIds = ensureIds(decks.map((d) => d.id));
    const userIds = ensureIds(decks.map((d) => d.user_id));
    const categoryIds = ensureIds(decks.map((d) => d.category_id));

    // flashcards counts
    const { data: flashRows, error: fErr } = await supabase
      .from("flashcards")
      .select("deck_id")
      .in("deck_id", deckIds);
    const flashCounts = new Map<string, number>();
    if (!fErr && flashRows) {
      for (const r of flashRows) {
        flashCounts.set(r.deck_id, (flashCounts.get(r.deck_id) ?? 0) + 1);
      }
    }

    // categories
    let categoriesById = new Map<string, any>();
    if (categoryIds.length > 0) {
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name")
        .in("id", categoryIds);
      if (cats) categoriesById = new Map(cats.map((c: any) => [c.id, c]));
    }

    // profiles (best-effort)
    let profilesById = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);
      if (profiles) profilesById = new Map(profiles.map((p: any) => [p.id, p]));
    }

    // fetch auth.users email for each user_id (SERVICE ROLE required) - best-effort
    const authEmailsById = new Map<string, string | null>();
    if (userIds.length > 0) {
      // parallel requests (small N typical). tolerate failures.
      const promises = userIds.map(async (uid) => {
        try {
          const { data } = await supabase.auth.admin.getUserById(uid);
          const email = data?.user?.email ?? null;
          authEmailsById.set(uid, email);
        } catch {
          authEmailsById.set(uid, null);
        }
      });
      await Promise.all(promises);
    }

    // reported: if requested, detect via deck_reports table (best-effort)
    const reportedSet = new Set<string>();
    if (status === "reported") {
      const { data: repRows, error: rErr } = await supabase
        .from("deck_reports")
        .select("deck_id")
        .in("deck_id", deckIds);
      if (!rErr && repRows) {
        for (const r of repRows) reportedSet.add(r.deck_id);
      } else {
        const maybeReported = decks.filter((d: any) => (d as any).reported);
        for (const d of maybeReported) reportedSet.add(d.id);
      }
    } else {
      // when not filtering by reported, still check presence of deck_reports to mark rows
      const { data: repRows, error: rErr } = await supabase
        .from("deck_reports")
        .select("deck_id")
        .in("deck_id", deckIds);
      if (!rErr && repRows) {
        for (const r of repRows) reportedSet.add(r.deck_id);
      }
    }

    // assemble hydrated rows; prefer auth.users.email for creator email, fallback to profile.email
    const out = decks.map((d) => {
      const profile = d.user_id ? profilesById.get(d.user_id) ?? null : null;
      const authEmail = d.user_id
        ? authEmailsById.get(d.user_id) ?? null
        : null;
      const creator = d.user_id
        ? {
            id: d.user_id,
            full_name: profile?.full_name ?? null,
            email: authEmail ?? profile?.email ?? null,
            avatar_url: profile?.avatar_url ?? null,
          }
        : null;

      return {
        ...d,
        flashcards_count: flashCounts.get(d.id) ?? 0,
        category: d.category_id
          ? categoriesById.get(d.category_id) ?? null
          : null,
        creator,
        reported: reportedSet.has(d.id),
      } as DeckRow;
    });

    return { ok: true, data: { decks: out, page, perPage } };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to list decks" };
  }
}

/**
 * Get deck detail (deck row + flashcards + creator + category).
 */
export async function getDeckAction(
  deckId: string
): Promise<Result<DeckRow & { flashcards?: any[] }>> {
  try {
    if (!deckId) return { ok: false, error: "Missing deck id" };
    const supabase = getAdminClient();

    const { data: deckRows, error } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!deckRows) return { ok: false, error: "Deck not found" };

    const deck = deckRows as DeckRow;

    // flashcards
    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("id, front, back, difficulty, position, created_at, updated_at")
      .eq("deck_id", deckId)
      .order("position", { ascending: true });

    // category
    const { data: category } = await supabase
      .from("categories")
      .select("id, name, description")
      .eq("id", deck.category_id)
      .maybeSingle();

    // creator profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", deck.user_id)
      .maybeSingle();

    // flashcards count
    const flashCount = Array.isArray(flashcards) ? flashcards.length : 0;

    return {
      ok: true,
      data: {
        ...deck,
        category: category ?? null,
        creator: profile ?? null,
        flashcards_count: flashCount,
        flashcards: flashcards ?? [],
      },
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to get deck" };
  }
}

/* Moderation actions */

/** Approve (publish) a deck */
export async function approveDeckAction(
  deckId: string
): Promise<Result<DeckRow>> {
  try {
    if (!deckId) return { ok: false, error: "Missing deck id" };
    const supabase = getAdminClient();

    const { error } = await supabase
      .from("decks")
      .update({
        is_public: true,
        is_archived: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId);
    if (error) return { ok: false, error: error.message };

    const res = await getDeckAction(deckId);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, data: res.data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to approve deck" };
  }
}

/** Mark deck as under review (hide from public) */
export async function setDeckReviewAction(
  deckId: string
): Promise<Result<DeckRow>> {
  try {
    if (!deckId) return { ok: false, error: "Missing deck id" };
    const supabase = getAdminClient();

    const { error } = await supabase
      .from("decks")
      .update({
        is_public: false,
        is_archived: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId);
    if (error) return { ok: false, error: error.message };

    const res = await getDeckAction(deckId);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, data: res.data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to set deck to review" };
  }
}

/** Block (archive) a deck */
export async function blockDeckAction(
  deckId: string
): Promise<Result<DeckRow>> {
  try {
    if (!deckId) return { ok: false, error: "Missing deck id" };
    const supabase = getAdminClient();

    const { error } = await supabase
      .from("decks")
      .update({
        is_archived: true,
        is_public: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId);
    if (error) return { ok: false, error: error.message };

    const res = await getDeckAction(deckId);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, data: res.data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to block deck" };
  }
}

/** Unblock (un-archive) a deck (keeps it private by default) */
export async function unblockDeckAction(
  deckId: string
): Promise<Result<DeckRow>> {
  try {
    if (!deckId) return { ok: false, error: "Missing deck id" };
    const supabase = getAdminClient();

    const { error } = await supabase
      .from("decks")
      .update({ is_archived: false, updated_at: new Date().toISOString() })
      .eq("id", deckId);
    if (error) return { ok: false, error: error.message };

    const res = await getDeckAction(deckId);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, data: res.data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to unblock deck" };
  }
}

/**
 * Delete deck and dependent objects (flashcards, user_deck_progress, study_sessions, card_study_records).
 * This is best-effort and will attempt to remove related rows. If you have FK cascade set up
 * in the DB some deletes may be redundant.
 */
export async function deleteDeckAction(deckId: string): Promise<Result<null>> {
  try {
    if (!deckId) return { ok: false, error: "Missing deck id" };
    const supabase = getAdminClient();

    // fetch flashcard ids
    const { data: flashcards, error: fErr } = await supabase
      .from("flashcards")
      .select("id")
      .eq("deck_id", deckId);
    if (fErr) return { ok: false, error: fErr.message };
    const flashIds = (flashcards ?? []).map((f: any) => f.id);

    // delete card_study_records for those flashcards
    if (flashIds.length > 0) {
      await supabase
        .from("card_study_records")
        .delete()
        .in("flashcard_id", flashIds);
    }

    // delete study_sessions referencing this deck
    await supabase.from("study_sessions").delete().eq("deck_id", deckId);

    // delete flashcards
    await supabase.from("flashcards").delete().eq("deck_id", deckId);

    // delete user_deck_progress
    await supabase.from("user_deck_progress").delete().eq("deck_id", deckId);

    // delete deck_reports if exists
    await supabase
      .from("deck_reports")
      .delete()
      .eq("deck_id", deckId)
      .maybeSingle();

    // finally delete deck
    const { error: dErr } = await supabase
      .from("decks")
      .delete()
      .eq("id", deckId);
    if (dErr) return { ok: false, error: dErr.message };

    return { ok: true, data: null };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to delete deck" };
  }
}
