"use server";

import { dbQuery } from "@sb/db";
import { getUserIdFromCookie } from "@sb/auth";

export async function getUserDecksAction() {
  const userId = await getUserIdFromCookie();
  if (!userId) return [];
  const sql = `
    select d.id, d.name, count(f.id)::int as total_cards
    from public.decks d
    left join public.flashcards f on f.deck_id = d.id
    where d.user_id = $1
    group by d.id
    order by d.updated_at desc nulls last, d.created_at desc
  `;
  return dbQuery<{ id: string; name: string; total_cards: number }>(sql, [userId]);
}

/** Returns rows grouped by deck for the given selections */
export async function exportDecksGroupedAction(deckIds: string[]) {
  const userId = await getUserIdFromCookie();
  if (!userId || !deckIds.length) return [];

  const sql = `
    select d.id as deck_id, d.name as deck_name, f.front, f.back, f.difficulty
    from public.flashcards f
    join public.decks d on d.id = f.deck_id
    where d.user_id = $1 and d.id = any($2)
    order by d.name, f.position
  `;
  const rows = await dbQuery<{
    deck_id: string;
    deck_name: string;
    front: string;
    back: string;
    difficulty: number | null;
  }>(sql, [userId, deckIds]);

  // group by deck
  const map = new Map<string, { deck_id: string; deck_name: string; rows: {front:string;back:string;difficulty:number|null}[] }>();
  for (const r of rows) {
    const key = r.deck_id;
    if (!map.has(key)) map.set(key, { deck_id: r.deck_id, deck_name: r.deck_name, rows: [] });
    map.get(key)!.rows.push({ front: r.front, back: r.back, difficulty: r.difficulty });
  }
  return Array.from(map.values());
}
