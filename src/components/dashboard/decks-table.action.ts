// decks-table.action.ts
"use server";

import { getUserIdFromCookie } from "@sb/auth";
import { dbQuery } from "@sb/db";

/* ----------------------------- Types ----------------------------- */

export type DeckRow = {
  id: string;
  name: string;
  cards: number;
  created_at: string; // ISO
  last_studied_at: string | null;
  updated_at: string | null;
  category_id: string | null;
  category_name: string | null;
};

export type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
};

type Filter = "all" | "recent";

/* ------------------------- Decks - Read -------------------------- */

export async function getDecksAction(
  filter: Filter = "all",
  opts?: { search?: string; limit?: number }
): Promise<DeckRow[]> {
  const userId = await getUserIdFromCookie();
  if (!userId) return [];

  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);
  const search = (opts?.search ?? "").trim();
  const hasSearch = search.length > 0;

  const params: unknown[] = [userId];
  let where = `d.user_id = $1`;
  if (hasSearch) {
    // Match on deck name OR category name
    params.push(`%${search}%`);
    where += ` and (d.name ilike $${params.length} or c.name ilike $${params.length})`;
  }

  const sql = `
    with card_counts as (
      select deck_id, count(*)::int as cards
      from public.flashcards
      group by deck_id
    )
    select
      d.id,
      d.name,
      coalesce(cc.cards, 0) as cards,
      d.created_at,
      d.last_studied_at,
      d.updated_at,
      d.category_id,
      c.name as category_name
    from public.decks d
    left join card_counts cc on cc.deck_id = d.id
    left join public.categories c on c.id = d.category_id
    where ${where}
    order by
      ${
        filter === "recent"
          ? `coalesce(d.last_studied_at, d.updated_at, d.created_at) desc nulls last`
          : `coalesce(d.updated_at, d.created_at) desc nulls last`
      },
      d.id desc
    limit ${limit};
  `;

  return dbQuery<DeckRow>(sql, params);
}

/* ------------------------- Decks - Create ------------------------ */

export async function createDeckAction(input: {
  name: string;
  categoryId?: string | null;
}) {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("Not authenticated");

  const name = (input.name ?? "").trim();
  const categoryId =
    input.categoryId == null || input.categoryId === ""
      ? null
      : (input.categoryId ?? "").trim();

  if (name.length < 2) throw new Error("Deck name is too short");

  const sql = `
    insert into public.decks (name, user_id, category_id)
    values ($1, $2, $3)
    returning id, name, created_at, last_studied_at, updated_at, category_id
  `;
  const [row] = await dbQuery<{
    id: string;
    name: string;
    created_at: string;
    last_studied_at: string | null;
    updated_at: string | null;
    category_id: string | null;
  }>(sql, [name, userId, categoryId]);

  // fetch category name (cheap join) so caller has it immediately
  const cat =
    row.category_id == null
      ? null
      : (
          await dbQuery<{ name: string }>(
            `select name from public.categories where id = $1`,
            [row.category_id]
          )
        )[0]?.name ?? null;

  return {
    id: row.id,
    name: row.name,
    cards: 0,
    created_at: row.created_at,
    last_studied_at: row.last_studied_at,
    updated_at: row.updated_at,
    category_id: row.category_id,
    category_name: cat,
  } as DeckRow;
}

/* -------------------------- Decks - Update ----------------------- */

export async function updateDeckAction(input: {
  id: string;
  name: string;
  categoryId?: string | null;
}) {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("Not authenticated");

  const id = (input.id ?? "").trim();
  const name = (input.name ?? "").trim();
  const categoryId =
    input.categoryId == null || input.categoryId === ""
      ? null
      : (input.categoryId ?? "").trim();

  if (!id) throw new Error("Missing deck id");
  if (name.length < 2) throw new Error("Deck name is too short");

  const sql = `
    update public.decks
    set name = $1,
        category_id = $2,
        updated_at = now()
    where id = $3 and user_id = $4
    returning id, name, created_at, last_studied_at, updated_at, category_id
  `;

  const rows = await dbQuery<{
    id: string;
    name: string;
    created_at: string;
    last_studied_at: string | null;
    updated_at: string | null;
    category_id: string | null;
  }>(sql, [name, categoryId, id, userId]);

  const row = rows[0];
  if (!row) {
    throw new Error("Deck not found or you do not have permission to edit it.");
  }

  const cat =
    row.category_id == null
      ? null
      : (
          await dbQuery<{ name: string }>(
            `select name from public.categories where id = $1`,
            [row.category_id]
          )
        )[0]?.name ?? null;

  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    last_studied_at: row.last_studied_at,
    updated_at: row.updated_at,
    category_id: row.category_id,
    category_name: cat,
  } as DeckRow;
}

/* -------------------------- Decks - Delete ----------------------- */

export async function deleteDeckAction(input: { id: string }) {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("Not authenticated");

  const id = (input.id ?? "").trim();
  if (!id) throw new Error("Missing deck id");

  const rows = await dbQuery<{ id: string }>(
    `delete from public.decks where id = $1 and user_id = $2 returning id`,
    [id, userId]
  );

  if (!rows[0]) {
    throw new Error(
      "Deck not found or you do not have permission to delete it."
    );
  }

  return { id: rows[0].id };
}

/* --------------------- Categories - Read helper ------------------ */

export async function getCategoriesAction(): Promise<
  Pick<CategoryRow, "id" | "name">[]
> {
  // Public data; auth not strictly required, but kept consistent.
  const rows = await dbQuery<Pick<CategoryRow, "id" | "name">>(
    `
    select id, name
    from public.categories
    order by name asc
  `,
    []
  );
  return rows;
}

/* ----------------------- Flashcards - Create --------------------- */

export type CreatedFlashcard = {
  id: string;
  deck_id: string;
  position: number | null;
  created_at: string;
  updated_at: string;
};

/** Create a flashcard in a deck owned by the current user. */
export async function createFlashcardAction(input: {
  deckId: string;
  front: string;
  back: string;
  difficulty?: string; // '1'..'5' (stored as varchar)
}): Promise<CreatedFlashcard> {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("Not authenticated");

  const deckId = (input.deckId ?? "").trim();
  const front = (input.front ?? "").trim();
  const back = (input.back ?? "").trim();
  const diff = String(
    Math.min(5, Math.max(1, Number(input.difficulty ?? 1) || 1))
  );

  if (!deckId) throw new Error("Missing deck id");
  if (!front || !back) throw new Error("Front and Back are required");

  // Ensure user owns the deck and it's not archived
  const own = await dbQuery<{ exists: boolean }>(
    `
    select exists(
      select 1
      from public.decks d
      where d.id = $1
        and d.user_id = $2
        and coalesce(d.is_archived, false) = false
    ) as exists
  `,
    [deckId, userId]
  );
  if (!own[0]?.exists) throw new Error("Deck not found or not owned by user");

  // Insert flashcard at next position within the deck
  const rows = await dbQuery<CreatedFlashcard>(
    `
    with next_pos as (
      select coalesce(max(position), 0) + 1 as pos
      from public.flashcards
      where deck_id = $1
    )
    insert into public.flashcards
      (deck_id, front, back, difficulty, position, created_at, updated_at)
    select
      $1, $2, $3, $4, (select pos from next_pos), now(), now()
    returning id, deck_id, position, created_at, updated_at
  `,
    [deckId, front, back, diff]
  );

  const row = rows[0];
  if (!row) throw new Error("Failed to create flashcard");

  // touch deck.updated_at so lists resort naturally
  await dbQuery(`update public.decks set updated_at = now() where id = $1`, [
    deckId,
  ]);

  return row;
}

/* ---------------------- Flashcards - Read/Edit ------------------- */

export type FlashcardRow = {
  id: string;
  front: string;
  back: string;
  difficulty: string | null;
  position: number | null;
  created_at: string;
  updated_at: string;
};

export async function getDeckFlashcardsAction(input: {
  deckId: string;
  limit?: number;
}): Promise<FlashcardRow[]> {
  const userId = await getUserIdFromCookie();
  if (!userId) return [];

  const deckId = (input.deckId ?? "").trim();
  const limit = Math.min(Math.max(Number(input.limit ?? 500), 1), 1000);
  if (!deckId) return [];

  const sql = `
    select
      c.id, c.front, c.back, c.difficulty, c.position, c.created_at, c.updated_at
    from public.flashcards c
    where c.deck_id = $1
      and exists (
        select 1 from public.decks d
        where d.id = c.deck_id
          and d.user_id = $2
          and coalesce(d.is_archived, false) = false
      )
    order by c.position asc nulls last,
             coalesce(c.updated_at, c.created_at) asc,
             c.id asc
    limit ${limit}
  `;
  return dbQuery<FlashcardRow>(sql, [deckId, userId]);
}

export async function updateFlashcardAction(input: {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty?: string | null; // '1'..'5' as text
}): Promise<FlashcardRow> {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("Not authenticated");

  const id = (input.id ?? "").trim();
  const deckId = (input.deckId ?? "").trim();
  const front = (input.front ?? "").trim();
  const back = (input.back ?? "").trim();
  const difficulty =
    input.difficulty == null || input.difficulty === ""
      ? null
      : String(Math.min(5, Math.max(1, Number(input.difficulty) || 1)));

  if (!id || !deckId) throw new Error("Missing ids");
  if (!front || !back) throw new Error("Front and Back are required");

  const sql = `
    update public.flashcards c
    set front = $1,
        back = $2,
        difficulty = $3,
        updated_at = now()
    where c.id = $4
      and c.deck_id = $5
      and exists (
        select 1 from public.decks d
        where d.id = c.deck_id and d.user_id = $6
      )
    returning c.id, c.front, c.back, c.difficulty, c.position, c.created_at, c.updated_at
  `;
  const rows = await dbQuery<FlashcardRow>(sql, [
    front,
    back,
    difficulty,
    id,
    deckId,
    userId,
  ]);
  const row = rows[0];
  if (!row) throw new Error("Flashcard not found or not permitted");

  await dbQuery(`update public.decks set updated_at = now() where id = $1`, [
    deckId,
  ]);

  return row;
}

export async function deleteFlashcardAction(input: {
  id: string;
  deckId: string;
}): Promise<{ id: string }> {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("Not authenticated");

  const id = (input.id ?? "").trim();
  const deckId = (input.deckId ?? "").trim();
  if (!id || !deckId) throw new Error("Missing ids");

  const rows = await dbQuery<{ id: string }>(
    `
    delete from public.flashcards c
    using public.decks d
    where c.id = $1
      and c.deck_id = $2
      and d.id = c.deck_id
      and d.user_id = $3
    returning c.id
  `,
    [id, deckId, userId]
  );

  const row = rows[0];
  if (!row) throw new Error("Flashcard not found or not permitted");

  await dbQuery(`update public.decks set updated_at = now() where id = $1`, [
    deckId,
  ]);

  return { id: row.id };
}

export async function createCategoryAction(input: {
  name: string;
  description?: string | null;
}): Promise<{ id: string; name: string }> {
  // Require auth (adjust if categories are global/unauthenticated in your app)
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("Not authenticated");

  const name = (input.name ?? "").trim();
  const description =
    input.description == null || input.description === ""
      ? null
      : (input.description ?? "").trim();

  if (name.length < 2) throw new Error("Category name is too short");

  // Optional: de-dup by name (case-insensitive). Comment this block out if you want strict duplicates allowed.
  const existing = await dbQuery<{ id: string; name: string }>(
    `select id, name from public.categories where lower(name) = lower($1) limit 1`,
    [name]
  );
  if (existing[0]) {
    // Return the existing category instead of creating a duplicate
    return { id: existing[0].id, name: existing[0].name };
  }

  const rows = await dbQuery<{ id: string; name: string }>(
    `
    insert into public.categories (name, description, created_at, updated_at)
    values ($1, $2, now(), now())
    returning id, name
    `,
    [name, description]
  );

  const row = rows[0];
  if (!row) throw new Error("Failed to create category");
  return row;
}
