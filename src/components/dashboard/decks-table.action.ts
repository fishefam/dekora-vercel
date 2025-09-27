// actions/getDecksAction.ts
"use server";

import { getUserIdFromCookie } from "@sb/auth";
import { dbQuery } from "@sb/db";

export type DeckRow = {
  id: string;
  name: string;
  cards: number;
  created_at: string; // ISO
  last_studied_at: string | null;
  updated_at: string | null;
};

type Filter = "all" | "recent";

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
    params.push(`%${search}%`);
    where += ` and d.name ilike $${params.length}`;
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
      d.updated_at
    from public.decks d
    left join card_counts cc on cc.deck_id = d.id
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

export async function createDeckAction(input: { name: string }) {
  const userId = await getUserIdFromCookie();

  if (!userId) throw new Error("Not authenticated");

  const name = (input.name ?? "").trim();
  if (name.length < 2) throw new Error("Deck name is too short");

  const sql = `
    insert into public.decks (name, user_id)
    values ($1, $2)
    returning id, name, created_at, last_studied_at, updated_at
  `;
  const [row] = await dbQuery<{
    id: string;
    name: string;
    created_at: string;
    last_studied_at: string | null;
    updated_at: string | null;
  }>(sql, [name, userId]);

  // shape it so your component can slot it straight in
  return {
    id: row.id,
    name: row.name,
    cards: 0,
    created_at: row.created_at,
    last_studied_at: row.last_studied_at,
    updated_at: row.updated_at,
  };
}

export async function updateDeckAction(input: { id: string; name: string }) {
  const userId = await getUserIdFromCookie();

  if (!userId) throw new Error("Not authenticated");

  const id = (input.id ?? "").trim();
  const name = (input.name ?? "").trim();

  if (!id) throw new Error("Missing deck id");
  if (name.length < 2) throw new Error("Deck name is too short");

  const sql = `
    update public.decks
    set name = $1, updated_at = now()
    where id = $2 and user_id = $3
    returning id, name, created_at, last_studied_at, updated_at
  `;

  const rows = await dbQuery<{
    id: string;
    name: string;
    created_at: string;
    last_studied_at: string | null;
    updated_at: string | null;
  }>(sql, [name, id, userId]);

  const row = rows[0];
  if (!row) {
    throw new Error("Deck not found or you do not have permission to edit it.");
  }

  return row; // { id, name, created_at, last_studied_at, updated_at }
}

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
