"use server";

import { dbQuery } from "@sb/db";
import { getUserIdFromCookie } from "@sb/auth";

export type ImportRow = {
  front: string;
  back: string;
  difficulty?: number | null;
  position?: number | null;
};

export async function importFlashcardsAction(input: {
  deckName: string;
  rows: ImportRow[];
}) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return {
      ok: false,
      message: "Not authenticated.",
      deckId: null,
      inserted: 0,
    };
  }

  const deckName = (input.deckName ?? "").trim();
  if (!deckName) {
    return {
      ok: false,
      message: "Deck name is required.",
      deckId: null,
      inserted: 0,
    };
  }

  const rows = Array.isArray(input.rows) ? input.rows : [];
  if (rows.length === 0) {
    return {
      ok: false,
      message: "No rows to import.",
      deckId: null,
      inserted: 0,
    };
  }
  if (rows.length > 5000) {
    return {
      ok: false,
      message: "Import limit is 5000 cards per upload.",
      deckId: null,
      inserted: 0,
    };
  }

  // 1) Create the deck
  const deckInsertSql = `
    insert into public.decks (name, user_id, is_public, is_archived, created_at, updated_at, study_count, last_studied_at)
    values ($1, $2, false, false, now(), now(), 0, null)
    returning id
  `;
  const deckRes = await dbQuery<{ id: string }>(deckInsertSql, [
    deckName,
    userId,
  ]);
  const deckId = deckRes[0]?.id;
  if (!deckId) {
    return {
      ok: false,
      message: "Failed to create deck.",
      deckId: null,
      inserted: 0,
    };
  }

  // 2) Bulk insert flashcards using jsonb_to_recordset
  // Ensure we only send required keys and sanitize
  const payload = rows
    .map((r, i) => ({
      front: String(r.front ?? "").trim(),
      back: String(r.back ?? "").trim(),
      difficulty: Number.isFinite(r.difficulty as number)
        ? Number(r.difficulty)
        : null,
      position: Number.isFinite(r.position as number)
        ? Number(r.position)
        : i + 1,
    }))
    .filter((r) => r.front || r.back); // drop empty lines

  if (payload.length === 0) {
    return {
      ok: true,
      message: "Deck created, but no valid rows found.",
      deckId,
      inserted: 0,
    };
  }

  const insertCardsSql = `
    with rows as (
      select * from jsonb_to_recordset($2::jsonb)
      as x(front text, back text, difficulty int, position int)
    )
    insert into public.flashcards (deck_id, front, back, difficulty, position, created_at, updated_at)
    select $1, r.front, r.back, r.difficulty, coalesce(r.position, row_number() over (order by (select 1))), now(), now()
    from rows r
    returning id
  `;
  const inserted = await dbQuery<{ id: string }>(insertCardsSql, [
    deckId,
    JSON.stringify(payload),
  ]);

  return {
    ok: true,
    message: `Imported ${inserted.length} card(s) into "${deckName}".`,
    deckId,
    inserted: inserted.length,
  };
}
