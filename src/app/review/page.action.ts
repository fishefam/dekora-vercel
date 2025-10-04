"use server";

import { getUserIdFromCookie } from "@sb/auth";
import { dbQuery } from "@sb/db";

/** Decks to populate the Select */
export type ReviewDeck = {
  id: string;
  name: string;
  total_cards: number;
  last_studied_at: string | null;
  study_count: number | null;
};

/** Cards to review */
export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  difficulty: string | null;
  position: number | null;
};

/** Category type */
export type ReviewCategory = {
  id: string;
  name: string;
};

/** List categories (global) */
export async function getDeckCategoriesAction(): Promise<ReviewCategory[]> {
  const sql = `
    select id, name
    from public.categories
    order by name asc
  `;
  return dbQuery<ReviewCategory>(sql, []);
}

/** List the current user's decks with a card count, optionally filtered by category_id */
export async function getDecksForReviewAction(input?: {
  categoryId?: string | null;
}): Promise<ReviewDeck[]> {
  const userId = await getUserIdFromCookie();
  if (!userId) return [];

  const categoryId = (input?.categoryId ?? "").trim() || null;

  const sql = `
    with card_counts as (
      select deck_id, count(*)::int as total_cards
      from public.flashcards
      group by deck_id
    )
    select
      d.id,
      d.name,
      coalesce(cc.total_cards, 0) as total_cards,
      d.last_studied_at,
      d.study_count
    from public.decks d
    left join card_counts cc on cc.deck_id = d.id
    where d.user_id = $1
      and coalesce(d.is_archived, false) = false
      and ($2::uuid is null or d.category_id = $2)
    order by coalesce(d.updated_at, d.created_at) desc nulls last, d.id desc
  `;
  return dbQuery<ReviewDeck>(sql, [userId, categoryId]);
}

/** Load cards (front/back) for a deck the user owns */
export async function getDeckCardsAction(input: {
  deckId: string;
}): Promise<ReviewCard[]> {
  const userId = await getUserIdFromCookie();
  if (!userId) return [];

  const deckId = (input.deckId ?? "").trim();
  if (!deckId) return [];

  const sql = `
    select
      c.id,
      c.front,
      c.back,
      c.difficulty,
      c.position
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
  `;
  return dbQuery<ReviewCard>(sql, [deckId, userId]);
}

export async function recordStudyEventAction(input: {
  deckId: string;
  event: "view" | "flip" | "next" | "prev" | "answer" | "quiz";
  cardId?: string;
  correct?: boolean;
  cardsStudied?: number;
  durationSeconds?: number;
  mode?: "review" | "quiz";
}): Promise<void> {
  const userId = await getUserIdFromCookie();
  if (!userId) return;

  const deckId = (input.deckId ?? "").trim();
  if (!deckId) return;

  const shouldIncrement =
    input.event === "answer" || input.event === "next" || input.event === "prev";

  await dbQuery(
    `update public.decks
       set last_studied_at = now(),
           study_count = case when $3 then coalesce(study_count, 0) + 1 else study_count end,
           updated_at = now()
     where id = $1 and user_id = $2`,
    [deckId, userId, shouldIncrement]
  );

  const cardsStudied = input.cardsStudied ?? 1;
  const durationSeconds = input.durationSeconds ?? 0;
  const mode = input.mode ?? (input.event === "quiz" ? "quiz" : "review");

  await dbQuery(
    `insert into public.study_sessions
       (user_id, deck_id, started_at, ended_at, cards_studied, duration_seconds, mode)
     values ($1, $2, now(), now(), $3, $4, $5)`,
    [userId, deckId, cardsStudied, durationSeconds, mode]
  );
}
