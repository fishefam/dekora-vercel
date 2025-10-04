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
};

export type OverviewPoint = {
  date: string;          // YYYY-MM-DD
  cards: number;         // cards_studied per day
  sessions: number;      // sessions per day
  correct_rate: number | null; // if you track per-card correctness (nullable)
};

function timeframeStartExpr(t: Timeframe): string | null {
  switch (t) {
    case "day": return "now() - interval '1 day'";
    case "week": return "now() - interval '7 days'";
    case "month": return "now() - interval '30 days'";
    default: return null;
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
    };
  }

  const start = timeframeStartExpr(timeframe);

  // --- totals from study_sessions (matches ERD columns) ---
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

  // --- streaks over last 120 days (fixes "len" alias issue) ---
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
        MIN(d)                               AS start_d,
        MAX(d)                               AS end_d,
        COUNT(*)::int                        AS streak_len
      FROM seq
      GROUP BY (d - rn * interval '1 day')
    )
    SELECT
      COALESCE(MAX(streak_len), 0)                                         AS longest,
      COALESCE((SELECT streak_len FROM grp WHERE end_d = current_date), 0) AS current
  `;
  const [streak] = await dbQuery<{ longest: number; current: number }>(streakSql, [userId]);

  return {
    total_sessions: agg?.total_sessions ?? 0,
    total_cards: agg?.total_cards ?? 0,
    total_minutes: Math.round((agg?.total_seconds ?? 0) / 60),
    last_studied_at: agg?.last_iso ?? null,
    current_streak: streak?.current ?? 0,
    longest_streak: streak?.longest ?? 0,
  };
}

/**
 * 7-day overview (fills missing dates). Only uses study_sessions per ERD.
 * If you also have card_study_records with correctness, uncomment the join below.
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
    )
    SELECT
      to_char(s.d, 'YYYY-MM-DD') AS date,
      COALESCE(se.cards, 0)      AS cards,
      COALESCE(se.sessions, 0)   AS sessions,
      NULL::numeric              AS correct_rate    -- set to NULL unless you join correctness
    FROM series s
    LEFT JOIN sess se ON se.d = s.d
    ORDER BY s.d ASC
  `;
  const rows = await dbQuery<OverviewPoint>(sql, [userId, days]);
  return rows;
}
