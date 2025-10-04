// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";

const getUserIdFromCookie = jest.fn();
jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: (...args: any[]) => getUserIdFromCookie(...args),
}));

const dbQuery = jest.fn(async () => []);
jest.mock("@sb/db", () => ({
  dbQuery: (...args: any[]) => dbQuery(...args),
}));

import {
  getDecksForReviewAction,
  getDeckCardsAction,
  recordStudyEventAction,
} from "./page.action";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getDecksForReviewAction", () => {
  it("returns [] when no user", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await getDecksForReviewAction();
    expect(res).toEqual([]);
    expect(dbQuery).not.toHaveBeenCalled();
  });

  it("queries with user id and returns rows", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    const rows = [
      {
        id: "d1",
        name: "Deck",
        total_cards: 2,
        last_studied_at: null,
        study_count: 0,
      },
    ];
    dbQuery.mockResolvedValueOnce(rows);
    const res = await getDecksForReviewAction();
    expect(dbQuery).toHaveBeenCalledTimes(1);
    const [, params] = dbQuery.mock.calls[0];
    expect(params).toEqual(["u1"]);
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toMatchObject(rows[0]);
  });
});

describe("getDeckCardsAction", () => {
  it("returns [] when no user", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await getDeckCardsAction({ deckId: "d1" });
    expect(res).toEqual([]);
    expect(dbQuery).not.toHaveBeenCalled();
  });

  it("returns [] when no deckId", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    const res = await getDeckCardsAction({ deckId: "" as any });
    expect(res).toEqual([]);
    expect(dbQuery).not.toHaveBeenCalled();
  });

  it("queries with [deckId, userId] and returns rows", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    const rows = [
      { id: "c1", front: "F", back: "B", difficulty: "1", position: 1 },
      { id: "c2", front: "F2", back: "B2", difficulty: null, position: 2 },
    ];
    dbQuery.mockResolvedValueOnce(rows);
    const res = await getDeckCardsAction({ deckId: "d1" });
    expect(dbQuery).toHaveBeenCalledTimes(1);
    const [, params] = dbQuery.mock.calls[0];
    expect(params).toEqual(["d1", "u1"]);
    expect(res.length).toBe(2);
    expect(res[0]).toMatchObject(rows[0]);
  });
});

describe("recordStudyEventAction", () => {
  it("no-op without user or deck", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    await recordStudyEventAction({ deckId: "d1", event: "view" });
    expect(dbQuery).not.toHaveBeenCalled();

    jest.clearAllMocks();
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    await recordStudyEventAction({ deckId: "", event: "view" } as any);
    expect(dbQuery).not.toHaveBeenCalled();
  });

  it("updates deck and inserts session (increment for answer)", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    dbQuery.mockResolvedValue([]);
    await recordStudyEventAction({
      deckId: "d1",
      event: "answer",
      cardId: "c1",
      correct: true,
    });

    expect(dbQuery).toHaveBeenCalledTimes(2);
    const firstParams = dbQuery.mock.calls[0][1];
    const secondParams = dbQuery.mock.calls[1][1];
    expect(firstParams).toEqual(["d1", "u1", true]);
    expect(secondParams[0]).toBe("u1");
    expect(secondParams[1]).toBe("d1");
    expect(typeof secondParams[2]).toBe("number");
    expect(typeof secondParams[3]).toBe("number");
    expect(["review", "quiz"]).toContain(secondParams[4]);
  });

  it("does not increment for view", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("u1");
    dbQuery.mockResolvedValue([]);
    await recordStudyEventAction({ deckId: "d1", event: "view" });

    const firstParams = dbQuery.mock.calls[0][1];
    expect(firstParams).toEqual(["d1", "u1", false]);
  });
});
