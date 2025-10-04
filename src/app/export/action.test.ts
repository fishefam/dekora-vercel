// export/action.test.ts
import "@testing-library/jest-dom";

// ---- mocks ----
const getUserIdFromCookie = jest.fn();
jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: (...args: any[]) => getUserIdFromCookie(...args),
}));

const dbQuery = jest.fn();
jest.mock("@sb/db", () => ({
  dbQuery: (...args: any[]) => dbQuery(...args),
}));

import { getUserDecksAction, exportDecksGroupedAction } from "./action";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getUserDecksAction", () => {
  it("returns [] when unauthenticated", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await getUserDecksAction();
    expect(res).toEqual([]);
    expect(dbQuery).not.toHaveBeenCalled();
  });

  it("queries decks and returns rows", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    const rows = [
      { id: "d1", name: "Alpha", total_cards: 3 },
      { id: "d2", name: "Beta", total_cards: 0 },
    ];
    dbQuery.mockResolvedValueOnce(rows);

    const res = await getUserDecksAction();
    expect(dbQuery).toHaveBeenCalledTimes(1);
    const params = dbQuery.mock.calls[0][1];
    expect(params).toEqual(["u1"]);
    expect(res).toEqual(rows);
  });
});

describe("exportDecksGroupedAction", () => {
  it("returns [] when unauthenticated or no ids", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    expect(await exportDecksGroupedAction(["d1"])).toEqual([]);
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    expect(await exportDecksGroupedAction([])).toEqual([]);
  });

  it("groups rows by deck id and maps fields", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    dbQuery.mockResolvedValueOnce([
      {
        deck_id: "d1",
        deck_name: "Alpha",
        front: "Q1",
        back: "A1",
        difficulty: 1,
      },
      {
        deck_id: "d1",
        deck_name: "Alpha",
        front: "Q2",
        back: "A2",
        difficulty: null,
      },
      {
        deck_id: "d2",
        deck_name: "Beta",
        front: "X",
        back: "Y",
        difficulty: 3,
      },
    ]);

    const res = await exportDecksGroupedAction(["d1", "d2"]);

    expect(dbQuery).toHaveBeenCalledTimes(1);
    const params = dbQuery.mock.calls[0][1];
    expect(params).toEqual(["u1", ["d1", "d2"]]);

    // shape
    expect(res).toHaveLength(2);
    const alpha = res.find((g: any) => g.deck_id === "d1");
    const beta = res.find((g: any) => g.deck_id === "d2");

    expect(alpha?.deck_name).toBe("Alpha");
    expect(alpha?.rows).toEqual([
      { front: "Q1", back: "A1", difficulty: 1 },
      { front: "Q2", back: "A2", difficulty: null },
    ]);
    expect(beta?.deck_name).toBe("Beta");
    expect(beta?.rows).toEqual([{ front: "X", back: "Y", difficulty: 3 }]);
  });
});
