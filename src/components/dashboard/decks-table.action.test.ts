// decks-table.action.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";

jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: jest.fn(),
}));
jest.mock("@sb/db", () => ({
  dbQuery: jest.fn(),
}));

import { getUserIdFromCookie } from "@sb/auth";
import { dbQuery } from "@sb/db";

import {
  getDecksAction,
  createDeckAction,
  updateDeckAction,
  deleteDeckAction,
  createFlashcardAction,
  getDeckFlashcardsAction,
  updateFlashcardAction,
  deleteFlashcardAction,
  type DeckRow,
  type FlashcardRow,
} from "./decks-table.action";

const mockedAuth = getUserIdFromCookie as jest.MockedFunction<
  typeof getUserIdFromCookie
>;
const mockedDb = dbQuery as jest.MockedFunction<typeof dbQuery>;

beforeEach(() => {
  jest.clearAllMocks();
});

/* ------------------------------ getDecksAction ------------------------------ */

describe("getDecksAction", () => {
  it("returns [] when not logged in", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const rows = await getDecksAction("all");
    expect(rows).toEqual([]);
    expect(mockedDb).not.toHaveBeenCalled();
  });

  it("builds SQL with search and respects limit clamp; default order for 'all'", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    const sample: DeckRow[] = [
      {
        id: "d1",
        name: "Spanish",
        cards: 10,
        created_at: "2025-10-01T00:00:00Z",
        last_studied_at: "2025-10-02T00:00:00Z",
        updated_at: "2025-10-03T00:00:00Z",
        category_id: null,
        category_name: null,
      },
    ];
    mockedDb.mockResolvedValueOnce(sample as any);

    const res = await getDecksAction("all", { search: "spa", limit: 9999 });
    expect(res).toEqual(sample);

    expect(mockedDb).toHaveBeenCalledTimes(1);
    const sql = mockedDb.mock.calls[0][0] as string;
    const params = mockedDb.mock.calls[0][1] as any[];
    expect(sql).toMatch(/from public\.decks d/i);
    expect(sql).toMatch(/left join card_counts/i);
    expect(sql).toMatch(/d\.name ilike \$2/i);
    expect(sql).toMatch(
      /coalesce\(d\.updated_at, d\.created_at\) desc nulls last/i
    );
    expect(sql).toMatch(/limit 100;?/i); // clamped to 100
    expect(params).toEqual(["u1", "%spa%"]);
  });

  it("uses 'recent' sort when filter=recent and limit lower bound clamp works", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    mockedDb.mockResolvedValueOnce([] as any);

    await getDecksAction("recent", { limit: 0 });

    const sql = mockedDb.mock.calls[0][0] as string;
    expect(sql).toMatch(
      /coalesce\(d\.last_studied_at, d\.updated_at, d\.created_at\) desc nulls last/i
    );
    expect(sql).toMatch(/limit 1;?/i); // lower clamp to 1
  });
});

/* ------------------------------ createDeckAction ------------------------------ */

describe("createDeckAction", () => {
  it("throws when not logged in", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(createDeckAction({ name: "New" })).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("validates name length", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    await expect(createDeckAction({ name: " x " })).rejects.toThrow(
      "Deck name is too short"
    );
  });

  it("creates and maps return with cards=0 (no category)", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    // INSERT returning
    mockedDb.mockResolvedValueOnce([
      {
        id: "d1",
        name: "Deck Name",
        created_at: "2025-10-01T00:00:00Z",
        last_studied_at: null,
        updated_at: null,
        category_id: undefined, // as returned by DB layer when null
      },
    ] as any);

    const res = await createDeckAction({ name: "Deck Name" });

    expect(res).toEqual({
      id: "d1",
      name: "Deck Name",
      cards: 0,
      created_at: "2025-10-01T00:00:00Z",
      last_studied_at: null,
      updated_at: null,
      category_id: undefined,
      category_name: null, // because category_id is null/undefined
    });

    const sql = mockedDb.mock.calls[0][0] as string;
    const params = mockedDb.mock.calls[0][1] as any[];
    expect(sql).toMatch(/insert into public\.decks/i);
    expect(params).toEqual(["Deck Name", "u1", null]); // name, userId, categoryId(null)
  });
});

/* ------------------------------ updateDeckAction ------------------------------ */

describe("updateDeckAction", () => {
  it("requires auth and inputs", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(updateDeckAction({ id: "x", name: "y" })).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("validates id and name", async () => {
    mockedAuth.mockResolvedValue("u1");
    await expect(updateDeckAction({ id: "", name: "ok" })).rejects.toThrow(
      "Missing deck id"
    );
    await expect(updateDeckAction({ id: "d1", name: " x " })).rejects.toThrow(
      "Deck name is too short"
    );
  });

  it("throws when deck not found", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    // UPDATE returning -> []
    mockedDb.mockResolvedValueOnce([] as any);

    await expect(
      updateDeckAction({ id: "d1", name: "New Name" })
    ).rejects.toThrow(
      "Deck not found or you do not have permission to edit it."
    );

    // Ensure SQL params include categoryId placeholder (= null)
    const sql = mockedDb.mock.calls[0][0] as string;
    const params = mockedDb.mock.calls[0][1] as any[];
    expect(sql).toMatch(/update public\.decks/i);
    expect(params).toEqual(["New Name", null, "d1", "u1"]);
  });

  it("updates and returns row (no category lookup when category_id is null)", async () => {
    mockedAuth.mockResolvedValueOnce("u1");

    // UPDATE returning one row; category_id null -> no follow-up category SELECT
    mockedDb.mockResolvedValueOnce([
      {
        id: "d1",
        name: "New Name",
        created_at: "2025-10-01T00:00:00Z",
        last_studied_at: null,
        updated_at: "2025-10-04T10:00:00Z",
        category_id: null,
      },
    ] as any);

    const row = await updateDeckAction({ id: "d1", name: "New Name" });
    expect(row.id).toBe("d1");

    const sql = mockedDb.mock.calls[0][0] as string;
    const params = mockedDb.mock.calls[0][1] as any[];
    expect(sql).toMatch(/update public\.decks/i);
    expect(params).toEqual(["New Name", null, "d1", "u1"]);
  });
});

/* ------------------------------ deleteDeckAction ------------------------------ */

describe("deleteDeckAction", () => {
  it("requires auth and id", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(deleteDeckAction({ id: "d1" })).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("throws when not found", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    // missing id
    await expect(deleteDeckAction({ id: " " })).rejects.toThrow(
      "Missing deck id"
    );

    // delete returning [] -> not found
    mockedDb.mockResolvedValueOnce([] as any);
    await expect(deleteDeckAction({ id: "d1" })).rejects.toThrow(
      "Deck not found or you do not have permission to delete it."
    );

    const sql = mockedDb.mock.calls[0][0] as string;
    const params = mockedDb.mock.calls[0][1] as any[];
    expect(sql).toMatch(/delete from public\.decks/i);
    expect(params).toEqual(["d1", "u1"]);
  });

  it("deletes and returns id", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    mockedDb.mockResolvedValueOnce([{ id: "d1" }] as any);

    const res = await deleteDeckAction({ id: "d1" });
    expect(res).toEqual({ id: "d1" });

    const sql = mockedDb.mock.calls[0][0] as string;
    const params = mockedDb.mock.calls[0][1] as any[];
    expect(sql).toMatch(/delete from public\.decks/i);
    expect(params).toEqual(["d1", "u1"]);
  });
});

/* ------------------------------ createFlashcardAction ------------------------------ */

describe("createFlashcardAction", () => {
  it("requires auth and input validation", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(
      createFlashcardAction({ deckId: "d1", front: "F", back: "B" })
    ).rejects.toThrow("Not authenticated");

    mockedAuth.mockResolvedValue("u1");
    await expect(
      createFlashcardAction({ deckId: " ", front: "F", back: "B" })
    ).rejects.toThrow("Missing deck id");
    await expect(
      createFlashcardAction({ deckId: "d1", front: "", back: "" })
    ).rejects.toThrow("Front and Back are required");
  });

  it("throws if ownership check fails", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    // ownership exists = false
    mockedDb.mockResolvedValueOnce([{ exists: false }] as any);
    await expect(
      createFlashcardAction({
        deckId: "d1",
        front: "Fr",
        back: "Bk",
        difficulty: "10",
      })
    ).rejects.toThrow("Deck not found or not owned by user");
  });

  it("inserts with normalized difficulty and touches deck.updated_at", async () => {
    mockedAuth.mockResolvedValueOnce("u1");

    // ownership exists = true
    mockedDb.mockResolvedValueOnce([{ exists: true }] as any);
    // insert returning
    mockedDb.mockResolvedValueOnce([
      {
        id: "c1",
        deck_id: "d1",
        position: 1,
        created_at: "2025-10-04T10:00:00Z",
        updated_at: "2025-10-04T10:00:00Z",
      },
    ] as any);
    // touch deck
    mockedDb.mockResolvedValueOnce([] as any);

    const row = await createFlashcardAction({
      deckId: "d1",
      front: "Fr",
      back: "Bk",
      difficulty: "10", // coerced to '5'
    });
    expect(row.id).toBe("c1");

    // check INSERT used coerced difficulty "5"
    const insertCall = mockedDb.mock.calls.find(([sql]) =>
      /insert into public\.flashcards/i.test(String(sql))
    )!;
    const insertParams = insertCall[1] as any[];
    expect(insertParams).toEqual(["d1", "Fr", "Bk", "5"]);

    // last call updates deck timestamp
    const lastSql = mockedDb.mock.calls[mockedDb.mock.calls.length - 1][0] as string;
    expect(lastSql).toMatch(/update public\.decks set updated_at = now\(\)/i);
  });
});

/* ------------------------------ getDeckFlashcardsAction ------------------------------ */

describe("getDeckFlashcardsAction", () => {
  it("returns [] when not logged in or deckId missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    expect(await getDeckFlashcardsAction({ deckId: "d1" })).toEqual([]);
    expect(mockedDb).not.toHaveBeenCalled();

    mockedAuth.mockResolvedValue("u1");
    expect(await getDeckFlashcardsAction({ deckId: " " })).toEqual([]);
  });

  it("clamps limit, filters by user ownership via EXISTS, and orders", async () => {
    mockedAuth.mockResolvedValue("u1");
    const rows: FlashcardRow[] = [
      {
        id: "c1",
        front: "F",
        back: "B",
        difficulty: "3",
        position: 1,
        created_at: "2025-10-01T00:00:00Z",
        updated_at: "2025-10-01T00:00:00Z",
      },
    ];
    mockedDb.mockResolvedValueOnce(rows as any);

    const res = await getDeckFlashcardsAction({ deckId: "d1", limit: 5_000 });
    expect(res).toEqual(rows);

    const sql = mockedDb.mock.calls[0][0] as string;
    const params = mockedDb.mock.calls[0][1] as any[];
    expect(sql).toMatch(/from public\.flashcards c/i);
    expect(sql).toMatch(/exists\s*\(\s*select 1 from public\.decks d/i);
    expect(sql).toMatch(/order by c\.position asc nulls last/i);
    expect(sql).toMatch(/limit 1000/i); // clamped
    expect(params).toEqual(["d1", "u1"]);
  });
});

/* ------------------------------ updateFlashcardAction ------------------------------ */

describe("updateFlashcardAction", () => {
  it("requires auth and validates", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(
      updateFlashcardAction({ id: "c1", deckId: "d1", front: "f", back: "b" })
    ).rejects.toThrow("Not authenticated");

    mockedAuth.mockResolvedValue("u1");
    await expect(
      updateFlashcardAction({ id: "", deckId: "d1", front: "f", back: "b" })
    ).rejects.toThrow("Missing ids");
    await expect(
      updateFlashcardAction({ id: "c1", deckId: "d1", front: "", back: "" })
    ).rejects.toThrow("Front and Back are required");
  });

  it("throws when flashcard not found", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    // UPDATE returning []
    mockedDb.mockResolvedValueOnce([] as any);

    await expect(
      updateFlashcardAction({
        id: "c1",
        deckId: "d1",
        front: "F",
        back: "B",
        difficulty: "9",
      })
    ).rejects.toThrow("Flashcard not found or not permitted");
  });

  it("updates with difficulty coercion and touches deck", async () => {
    mockedAuth.mockResolvedValueOnce("u1");

    // UPDATE returning coerced '5'
    mockedDb.mockResolvedValueOnce([
      {
        id: "c1",
        front: "F",
        back: "B",
        difficulty: "5",
        position: 1,
        created_at: "2025-10-01T00:00:00Z",
        updated_at: "2025-10-04T10:00:00Z",
      },
    ] as any);
    // touch deck
    mockedDb.mockResolvedValueOnce([] as any);

    const row = await updateFlashcardAction({
      id: "c1",
      deckId: "d1",
      front: "F",
      back: "B",
      difficulty: "9",
    });
    expect(row.difficulty).toBe("5");

    const updateParams = mockedDb.mock.calls[0][1] as any[];
    expect(updateParams[2]).toBe("5"); // coerced
    const lastSql = mockedDb.mock.calls[1][0] as string;
    expect(lastSql).toMatch(/update public\.decks set updated_at = now\(\)/i);
  });
});

/* ------------------------------ deleteFlashcardAction ------------------------------ */

describe("deleteFlashcardAction", () => {
  it("requires auth and ids", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(
      deleteFlashcardAction({ id: "c1", deckId: "d1" })
    ).rejects.toThrow("Not authenticated");

    mockedAuth.mockResolvedValue("u1");
    await expect(deleteFlashcardAction({ id: "", deckId: "" })).rejects.toThrow(
      "Missing ids"
    );
  });

  it("throws when not found", async () => {
    mockedAuth.mockResolvedValueOnce("u1");
    mockedDb.mockResolvedValueOnce([] as any);

    await expect(
      deleteFlashcardAction({ id: "c1", deckId: "d1" })
    ).rejects.toThrow("Flashcard not found or not permitted");

    const deleteSql = mockedDb.mock.calls[0][0] as string;
    const deleteParams = mockedDb.mock.calls[0][1] as any[];
    expect(deleteSql).toMatch(
      /delete from public\.flashcards c[\s\S]*using public\.decks d/i
    );
    expect(deleteParams).toEqual(["c1", "d1", "u1"]);
  });

  it("deletes with user ownership join and touches deck", async () => {
    mockedAuth.mockResolvedValueOnce("u1");

    mockedDb.mockResolvedValueOnce([{ id: "c1" }] as any); // delete returning
    mockedDb.mockResolvedValueOnce([] as any); // touch deck

    const res = await deleteFlashcardAction({ id: "c1", deckId: "d1" });
    expect(res).toEqual({ id: "c1" });

    const lastSql = mockedDb.mock.calls[1][0] as string;
    expect(lastSql).toMatch(/update public\.decks set updated_at = now\(\)/i);
  });
});
