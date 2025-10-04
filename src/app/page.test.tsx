import { render } from "@testing-library/react";
import Page from "./page";

jest.mock("@/components/dashboard/decks-table.action", () => ({
  getDecksAction: jest.fn().mockResolvedValue([]),
  createDeckAction: jest.fn(),
  updateDeckAction: jest.fn(),
  deleteDeckAction: jest.fn(),
}));

describe("Page", () => {
  it("renders without crashing", () => {
    render(<Page />);
    expect(true).toBe(true);
  });
});
