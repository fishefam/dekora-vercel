/* eslint-disable @typescript-eslint/no-require-imports */
import { getDecksAction, createDeckAction } from "./decks-table.action";

// Mock @sb/auth → no real cookies()
jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: jest.fn(),
}));

// Mock @sb/db → no real DB
jest.mock("@sb/db", () => ({
  dbQuery: jest.fn(),
}));

describe("Decks actions", () => {
  const { getUserIdFromCookie } = require("@sb/auth");
  const { dbQuery } = require("@sb/db");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty decks if no user", async () => {
    getUserIdFromCookie.mockResolvedValue(null);

    const decks = await getDecksAction();
    expect(decks).toEqual([]);
  });

  it("creates a deck", async () => {
    getUserIdFromCookie.mockResolvedValue("user-1");
    dbQuery.mockResolvedValueOnce([
      {
        id: "1",
        name: "Biology",
        created_at: "2025-01-01",
        last_studied_at: null,
        updated_at: null,
      },
    ]);

    const deck = await createDeckAction({ name: "Biology" });
    expect(deck).toMatchObject({
      id: "1",
      name: "Biology",
      cards: 0,
    });
  });
});
