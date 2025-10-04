// import/action.test.ts
import "@testing-library/jest-dom";

const getUserIdFromCookie = jest.fn();
jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: (...args: any[]) => getUserIdFromCookie(...args),
}));

const dbQuery = jest.fn();
jest.mock("@sb/db", () => ({
  dbQuery: (...args: any[]) => dbQuery(...args),
}));

import { importFlashcardsAction } from "./action";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("importFlashcardsAction (smoke)", () => {
  it("returns not authenticated when no user", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await importFlashcardsAction({
      deckName: "X",
      rows: [{ front: "A", back: "B" }],
    });
    expect(res).toMatchObject({
      ok: false,
      message: expect.stringMatching(/not authenticated/i),
    });
  });

  it("rejects empty deck name", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    const res = await importFlashcardsAction({
      deckName: "   ",
      rows: [{ front: "A", back: "B" }],
    });
    expect(res).toMatchObject({
      ok: false,
      message: expect.stringMatching(/deck name is required/i),
    });
  });

  it("rejects when rows array is empty", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    const res = await importFlashcardsAction({ deckName: "My Deck", rows: [] });
    expect(res).toMatchObject({
      ok: false,
      message: expect.stringMatching(/no rows/i),
    });
  });

  it("creates deck and inserts cards (happy path)", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");

    // 1st dbQuery -> deck insert returning id
    dbQuery
      .mockResolvedValueOnce([{ id: "d1" }])
      // 2nd dbQuery -> insert flashcards returning ids
      .mockResolvedValueOnce([{ id: "c1" }, { id: "c2" }]);

    const res = await importFlashcardsAction({
      deckName: "My Deck",
      rows: [
        { front: "Q1", back: "A1" },
        { front: "Q2", back: "A2", difficulty: 2, position: 7 },
      ],
    });

    expect(dbQuery).toHaveBeenCalledTimes(2);
    const [deckSql, deckParams] = dbQuery.mock.calls[0];
    expect(String(deckSql)).toContain("insert into public.decks");
    expect(deckParams).toEqual(["My Deck", "u1"]);

    const [cardsSql, cardsParams] = dbQuery.mock.calls[1];
    expect(String(cardsSql)).toContain("insert into public.flashcards");
    expect(Array.isArray(cardsParams)).toBe(true);
    expect(cardsParams[0]).toBe("d1");
    // payload is JSON string in params[1]
    expect(typeof cardsParams[1]).toBe("string");
    const payload = JSON.parse(cardsParams[1]);
    expect(payload.length).toBe(2);
    expect(payload[0]).toMatchObject({ front: "Q1", back: "A1" });
    expect(payload[1]).toMatchObject({
      front: "Q2",
      back: "A2",
      difficulty: 2,
      position: 7,
    });

    expect(res).toMatchObject({ ok: true, deckId: "d1", inserted: 2 });
  });

  it("creates deck but finds no valid rows (all empty lines)", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    dbQuery.mockResolvedValueOnce([{ id: "d2" }]); // deck creation

    const res = await importFlashcardsAction({
      deckName: "Emptyish",
      rows: [
        { front: "", back: "" },
        { front: "   ", back: "   " },
      ],
    });

    expect(res.ok).toBe(true);
    expect(res.deckId).toBe("d2");
    expect(res.inserted).toBe(0);
    expect(String(res.message)).toMatch(/no valid rows/i);
  });
});
