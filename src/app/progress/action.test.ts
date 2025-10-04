// progress/action.test.ts
import "@testing-library/jest-dom";

const getUserIdFromCookie = jest.fn();
jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: (...args: any[]) => getUserIdFromCookie(...args),
}));

const dbQuery = jest.fn();
jest.mock("@sb/db", () => ({
  dbQuery: (...args: any[]) => dbQuery(...args),
}));

import {
  getProgressSummaryAction,
  getOverviewAction,
  type Timeframe,
} from "./action";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getProgressSummaryAction", () => {
  it("returns zeros when unauthenticated", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await getProgressSummaryAction("all");
    expect(res).toEqual({
      total_sessions: 0,
      total_cards: 0,
      total_minutes: 0,
      last_studied_at: null,
      current_streak: 0,
      longest_streak: 0,
    });
    expect(dbQuery).not.toHaveBeenCalled();
  });

  it.each([
    ["day", "interval '1 day'"],
    ["week", "interval '7 days'"],
    ["month", "interval '30 days'"],
  ] as [Timeframe, string][])(
    "injects timeframe filter for %s",
    async (tf, needle) => {
      getUserIdFromCookie.mockResolvedValueOnce("u1");
      dbQuery
        .mockResolvedValueOnce([
          {
            total_sessions: 3,
            total_cards: 90,
            total_seconds: 540, // 9 minutes
            last_iso: "2025-09-30T11:22:33Z",
          },
        ])
        .mockResolvedValueOnce([{ longest: 5, current: 2 }]);

      const res = await getProgressSummaryAction(tf as Timeframe);

      expect(dbQuery).toHaveBeenCalledTimes(2);

      const firstSql = dbQuery.mock.calls[0][0] as string;
      expect(firstSql).toContain("FROM public.study_sessions");
      expect(firstSql).toContain("WHERE user_id = $1");
      expect(firstSql).toContain(needle);

      const firstParams = dbQuery.mock.calls[0][1];
      const secondParams = dbQuery.mock.calls[1][1];
      expect(firstParams).toEqual(["u1"]);
      expect(secondParams).toEqual(["u1"]);

      expect(res.total_sessions).toBe(3);
      expect(res.total_cards).toBe(90);
      expect(res.total_minutes).toBe(9);
      expect(res.last_studied_at).toBe("2025-09-30T11:22:33Z");
      expect(res.current_streak).toBe(2);
      expect(res.longest_streak).toBe(5);
    }
  );

  it("handles null aggregates safely", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    dbQuery
      .mockResolvedValueOnce([undefined]) // agg row missing
      .mockResolvedValueOnce([{ longest: 0, current: 0 }]);

    const res = await getProgressSummaryAction("all");
    expect(res).toMatchObject({
      total_sessions: 0,
      total_cards: 0,
      total_minutes: 0,
      last_studied_at: null,
      current_streak: 0,
      longest_streak: 0,
    });
  });
});

describe("getOverviewAction", () => {
  it("returns [] when unauthenticated", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await getOverviewAction();
    expect(res).toEqual([]);
    expect(dbQuery).not.toHaveBeenCalled();
  });

  it("queries with [userId, days] and returns rows (default 7)", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    const rows = [
      { date: "2025-09-28", cards: 5, sessions: 1, correct_rate: null },
      { date: "2025-09-29", cards: 3, sessions: 2, correct_rate: null },
    ];
    dbQuery.mockResolvedValueOnce(rows);

    const res = await getOverviewAction(); // default 7

    expect(dbQuery).toHaveBeenCalledTimes(1);
    const sql = dbQuery.mock.calls[0][0] as string;
    expect(sql).toContain("generate_series");
    expect(sql).toContain("LEFT JOIN sess");

    const params = dbQuery.mock.calls[0][1];
    expect(params).toEqual(["u1", 7]);
    expect(res).toEqual(rows);
  });

  it("accepts a custom days window", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    dbQuery.mockResolvedValueOnce([]);
    await getOverviewAction(14);
    const params = dbQuery.mock.calls[0][1];
    expect(params).toEqual(["u1", 14]);
  });
});
