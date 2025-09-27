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
