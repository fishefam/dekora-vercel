// src/app/review/page.action.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import "@testing-library/jest-dom";

// ✅ Fix TDZ: define mocks directly in the factory (no external `mockApi` var)
jest.mock("./page.action", () => ({
  __esModule: true,
  getDecksForReviewAction: jest.fn(),
  getDeckCardsAction: jest.fn(),
  recordStudyEventAction: jest.fn(),
  getDeckCategoriesAction: jest.fn(),
}));

import {
  getDecksForReviewAction,
  getDeckCardsAction,
  recordStudyEventAction,
  getDeckCategoriesAction,
} from "./page.action";

beforeEach(() => {
  jest.clearAllMocks();

  (getDeckCategoriesAction as jest.Mock).mockResolvedValue([
    { id: "cat1", name: "Languages" },
    { id: "cat2", name: "Programming" },
  ]);

  (getDecksForReviewAction as jest.Mock).mockResolvedValue([
    {
      id: "d1",
      name: "Deck",
      total_cards: 2,
      last_studied_at: null,
      study_count: 0,
    },
  ]);

  (getDeckCardsAction as jest.Mock).mockResolvedValue([
    { id: "c1", front: "F", back: "B", difficulty: "1", position: 1 },
    { id: "c2", front: "F2", back: "B2", difficulty: null, position: 2 },
  ]);

  (recordStudyEventAction as jest.Mock).mockResolvedValue(undefined);
});

describe("getDeckCategoriesAction", () => {
  it("returns categories", async () => {
    const res = await getDeckCategoriesAction();
    expect(Array.isArray(res)).toBe(true);
    expect(res).toEqual([
      { id: "cat1", name: "Languages" },
      { id: "cat2", name: "Programming" },
    ]);
    expect(getDeckCategoriesAction).toHaveBeenCalled();
  });
});

describe("getDecksForReviewAction", () => {
  it("returns decks for review", async () => {
    const res = await getDecksForReviewAction();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toMatchObject({
      id: "d1",
      name: "Deck",
      total_cards: 2,
    });
    expect(getDecksForReviewAction).toHaveBeenCalled();
  });

  it("supports category filter input without throwing", async () => {
    const res = await getDecksForReviewAction({ categoryId: "cat2" });
    expect(res).toEqual([
      {
        id: "d1",
        name: "Deck",
        total_cards: 2,
        last_studied_at: null,
        study_count: 0,
      },
    ]);
    expect(getDecksForReviewAction).toHaveBeenCalledWith({ categoryId: "cat2" });
  });
});

describe("getDeckCardsAction", () => {
  it("returns cards", async () => {
    const res = await getDeckCardsAction({ deckId: "d1" });
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(2);
    expect(res[0]).toMatchObject({
      id: "c1",
      front: "F",
      back: "B",
    });
    expect(getDeckCardsAction).toHaveBeenCalledWith({ deckId: "d1" });
  });
});

describe("recordStudyEventAction", () => {
  it("resolves without throwing", async () => {
    await expect(
      recordStudyEventAction({
        deckId: "d1",
        event: "answer",
        cardId: "c1",
        correct: true,
      })
    ).resolves.toBeUndefined();

    expect(recordStudyEventAction).toHaveBeenCalledWith({
      deckId: "d1",
      event: "answer",
      cardId: "c1",
      correct: true,
    });
  });
});
