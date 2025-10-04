// app/progress/action.ts
"use server";

import { dbQuery } from "@sb/db";
import { getUserIdFromCookie } from "@sb/auth";

export type Timeframe = "all" | "month" | "week" | "day";

export type ProgressSummary = {
  total_sessions: number;
  total_cards: number;
  total_minutes: number;
  last_studied_at: string | null;
  current_streak: number;
  longest_streak: number;
  // NEW
  total_decks: number;
  retention_rate: number; // 0..100, never undefined
};

export type OverviewPoint = {
  date: string;               // YYYY-MM-DD
  cards: number;              // cards_studied per day
  sessions: number;           // sessions per day
  correct_rate: number | null; // 0..100 or null when no answers that day
};

function timeframeStartExpr(t: Timeframe): string | null {
  switch (t) {
    case "day":
      return "now() - interval '1 day'";
    case "week":
      return "now() - interval '7 days'";
    case "month":
      return "now() - interval '30 days'";
    default:
      return null;
  }
}

export async function getProgressSummaryAction(
  timeframe: Timeframe
): Promise<ProgressSummary> {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return {
      total_sessions: 0,
      total_cards: 0,
      total_minutes: 0,
      last_studied_at: null,
      current_streak: 0,
      longest_streak: 0,
      total_decks: 0,
      retention_rate: 0,
    };
  }

  const start = timeframeStartExpr(timeframe);

  // totals from study_sessions
  const aggSql = `
    SELECT
      COUNT(*)::int                               AS total_sessions,
      COALESCE(SUM(cards_studied), 0)::int        AS total_cards,
      COALESCE(SUM(duration_seconds), 0)::int     AS total_seconds,
      to_char(MAX(COALESCE(ended_at, started_at)) AT TIME ZONE 'utc',
              'YYYY-MM-DD"T"HH24:MI:SS"Z"')       AS last_iso
    FROM public.study_sessions
    WHERE user_id = $1
      ${start ? `AND started_at >= ${start}` : ""}
  `;
  const [agg] = await dbQuery<{
    total_sessions: number;
    total_cards: number;
    total_seconds: number;
    last_iso: string | null;
  }>(aggSql, [userId]);

  // streaks over last 120 days
  const streakSql = `
    WITH days AS (
      SELECT DISTINCT date_trunc('day', started_at)::date AS d
      FROM public.study_sessions
      WHERE user_id = $1
        AND started_at >= now() - interval '120 days'
    ),
    seq AS (
      SELECT d, row_number() OVER (ORDER BY d) AS rn
      FROM days
    ),
    grp AS (
      SELECT
        MIN(d)                        AS start_d,
        MAX(d)                        AS end_d,
        COUNT(*)::int                 AS streak_len
      FROM seq
      GROUP BY (d - rn * interval '1 day')
    )
    SELECT
      COALESCE(MAX(streak_len), 0)                                         AS longest,
      COALESCE((SELECT streak_len FROM grp WHERE end_d = current_date), 0) AS current
    FROM grp
  `;
  const [streak] = await dbQuery<{ longest: number; current: number }>(streakSql, [userId]);

  // total decks (active)
  const [deckRow] = await dbQuery<{ total_decks: number }>(
    `SELECT COUNT(*)::int AS total_decks
     FROM public.decks
     WHERE user_id = $1 AND COALESCE(is_archived, false) = false`,
    [userId]
  );

  // retention rate from card_study_records within timeframe (if provided)
  const retSql = `
    SELECT
      COUNT(*)::int AS total,
      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int AS correct
    FROM public.card_study_records
    WHERE user_id = $1
      ${start ? `AND last_reviewed_at >= ${start}` : ""}
  `;
  const [ret] = await dbQuery<{ total: number; correct: number }>(retSql, [userId]);
  const retention_rate =
    ret?.total ? Math.round((ret.correct / ret.total) * 100) : 0;

  return {
    total_sessions: agg?.total_sessions ?? 0,
    total_cards: agg?.total_cards ?? 0,
    total_minutes: Math.round((agg?.total_seconds ?? 0) / 60),
    last_studied_at: agg?.last_iso ?? null,
    current_streak: streak?.current ?? 0,
    longest_streak: streak?.longest ?? 0,
    total_decks: deckRow?.total_decks ?? 0,
    retention_rate,
  };
}

/**
 * N-day overview (fills missing dates) with sessions, cards, and daily accuracy.
 */
export async function getOverviewAction(days = 7): Promise<OverviewPoint[]> {
  const userId = await getUserIdFromCookie();
  if (!userId) return [];

  const sql = `
    WITH series AS (
      SELECT generate_series(
        (current_date - ($2::int - 1) * interval '1 day')::date,
        current_date::date,
        interval '1 day'
      )::date AS d
    ),
    sess AS (
      SELECT
        date_trunc('day', started_at)::date AS d,
        COALESCE(SUM(cards_studied),0)::int AS cards,
        COUNT(*)::int                        AS sessions
      FROM public.study_sessions
      WHERE user_id = $1
      GROUP BY 1
    ),
    acc AS (
      SELECT
        date_trunc('day', last_reviewed_at)::date AS d,
        COUNT(*)::int AS total,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int AS correct
      FROM public.card_study_records
      WHERE user_id = $1
        AND last_reviewed_at IS NOT NULL
      GROUP BY 1
    )
    SELECT
      to_char(s.d, 'YYYY-MM-DD') AS date,
      COALESCE(se.cards, 0)      AS cards,
      COALESCE(se.sessions, 0)   AS sessions,
      CASE
        WHEN COALESCE(a.total,0) = 0 THEN NULL
        ELSE ROUND((a.correct::numeric / a.total) * 100, 1)
      END::float                 AS correct_rate
    FROM series s
    LEFT JOIN sess se ON se.d = s.d
    LEFT JOIN acc  a  ON a.d  = s.d
    ORDER BY s.d ASC
  `;
  const rows = await dbQuery<OverviewPoint>(sql, [userId, days]);
  return rows;
}
