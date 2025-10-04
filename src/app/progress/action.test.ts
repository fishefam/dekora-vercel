// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";

jest.mock("@sb/db", () => ({
  dbQuery: jest.fn(),
}));
jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: jest.fn(),
}));

import { dbQuery } from "@sb/db";
import { getUserIdFromCookie } from "@sb/auth";
import {
  getOverviewAction,
  getProgressSummaryAction,
  type ProgressSummary,
  type OverviewPoint,
} from "./action";

const mockedDbQuery = dbQuery as jest.MockedFunction<typeof dbQuery>;
const mockedGetUserId = getUserIdFromCookie as jest.MockedFunction<
  typeof getUserIdFromCookie
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getProgressSummaryAction", () => {
  it("returns zeros when user not logged in", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);

    const res = await getProgressSummaryAction("week");

    const expected: ProgressSummary = {
      total_sessions: 0,
      total_cards: 0,
      total_minutes: 0,
      last_studied_at: null,
      current_streak: 0,
      longest_streak: 0,
      total_decks: 0,
      retention_rate: 0,
    };
    expect(res).toEqual(expected);
    expect(mockedDbQuery).not.toHaveBeenCalled();
  });

  it("computes summary for week timeframe (and includes timeframe in SQL)", async () => {
    mockedGetUserId.mockResolvedValueOnce("user-1");

    // 1) totals (study_sessions agg)
    mockedDbQuery.mockResolvedValueOnce([
      {
        total_sessions: 2,
        total_cards: 10,
        total_seconds: 540, // 9 minutes
        last_iso: "2025-10-01T12:00:00Z",
      },
    ] as any);

    // 2) streaks
    mockedDbQuery.mockResolvedValueOnce([{ longest: 5, current: 2 }] as any);

    // 3) total decks
    mockedDbQuery.mockResolvedValueOnce([{ total_decks: 3 }] as any);

    // 4) retention (card_study_records)
    mockedDbQuery.mockResolvedValueOnce([{ total: 8, correct: 6 }] as any);

    const res = await getProgressSummaryAction("week");

    expect(res).toEqual<ProgressSummary>({
      total_sessions: 2,
      total_cards: 10,
      total_minutes: 9,
      last_studied_at: "2025-10-01T12:00:00Z",
      current_streak: 2,
      longest_streak: 5,
      total_decks: 3,
      retention_rate: 75, // round(6/8*100)
    });

    // Ensure each dbQuery call had the expected args
    expect(mockedDbQuery).toHaveBeenCalledTimes(4);

    // 1st SQL (agg) should include the 7-day filter
    const aggSql = mockedDbQuery.mock.calls[0][0] as string;
    const aggParams = mockedDbQuery.mock.calls[0][1];
    expect(aggSql).toMatch(/study_sessions/i);
    expect(aggSql).toMatch(/started_at >= now\(\) - interval '7 days'/i);
    expect(aggParams).toEqual(["user-1"]);

    // 2nd SQL (streaks)
    const streakSql = mockedDbQuery.mock.calls[1][0] as string;
    expect(streakSql).toMatch(/streak_len/i);
    expect(streakSql).toMatch(/120 days/i);

    // 3rd SQL (decks)
    const decksSql = mockedDbQuery.mock.calls[2][0] as string;
    expect(decksSql).toMatch(/FROM public\.decks/i);
    expect(decksSql).toMatch(/is_archived/i);

    // 4th SQL (retention) should include the 7-day filter
    const retSql = mockedDbQuery.mock.calls[3][0] as string;
    expect(retSql).toMatch(/FROM public\.card_study_records/i);
    expect(retSql).toMatch(/last_reviewed_at >= now\(\) - interval '7 days'/i);
  });

  it("handles empty/partial rows robustly", async () => {
    mockedGetUserId.mockResolvedValueOnce("user-1");

    // Return empty or undefined-like results from db
    mockedDbQuery.mockResolvedValueOnce([undefined as any]); // agg
    mockedDbQuery.mockResolvedValueOnce([undefined as any]); // streak
    mockedDbQuery.mockResolvedValueOnce([undefined as any]); // decks
    mockedDbQuery.mockResolvedValueOnce([{ total: 0, correct: 0 }] as any); // ret

    const res = await getProgressSummaryAction("all");

    expect(res).toEqual<ProgressSummary>({
      total_sessions: 0,
      total_cards: 0,
      total_minutes: 0,
      last_studied_at: null,
      current_streak: 0,
      longest_streak: 0,
      total_decks: 0,
      retention_rate: 0,
    });
  });
});

describe("getOverviewAction", () => {
  it("returns [] when not logged in", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);

    const points = await getOverviewAction();
    expect(points).toEqual([]);
    expect(mockedDbQuery).not.toHaveBeenCalled();
  });

  it("returns db rows as-is and passes [userId, days] args (default 7)", async () => {
    mockedGetUserId.mockResolvedValueOnce("u1");

    const rows: OverviewPoint[] = [
      { date: "2025-09-28", cards: 5, sessions: 1, correct_rate: 80 },
      { date: "2025-09-29", cards: 0, sessions: 0, correct_rate: null },
      { date: "2025-09-30", cards: 3, sessions: 1, correct_rate: 66.7 },
      { date: "2025-10-01", cards: 2, sessions: 1, correct_rate: 50 },
      { date: "2025-10-02", cards: 0, sessions: 0, correct_rate: null },
      { date: "2025-10-03", cards: 4, sessions: 2, correct_rate: 100 },
      { date: "2025-10-04", cards: 1, sessions: 1, correct_rate: 0 },
    ];

    mockedDbQuery.mockResolvedValueOnce(rows as any);

    const res = await getOverviewAction(); // default 7

    expect(res).toEqual(rows);
    expect(mockedDbQuery).toHaveBeenCalledTimes(1);

    const sql = mockedDbQuery.mock.calls[0][0] as string;
    const params = mockedDbQuery.mock.calls[0][1] as any[];
    expect(sql).toMatch(/generate_series/i);
    expect(sql).toMatch(/LEFT JOIN/i);
    expect(params).toEqual(["u1", 7]);
  });

  it("passes custom days param through to SQL", async () => {
    mockedGetUserId.mockResolvedValueOnce("u2");
    mockedDbQuery.mockResolvedValueOnce([] as any);

    await getOverviewAction(3);

    const params = mockedDbQuery.mock.calls[0][1] as any[];
    expect(params).toEqual(["u2", 3]);
  });
});
