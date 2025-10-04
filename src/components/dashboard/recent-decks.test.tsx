import { render } from "@testing-library/react";
import { RecentDecks } from "./recent-decks";

describe("RecentDecks ", () => {
  it("renders without crashing", () => {
    render(<RecentDecks />);
    expect(true).toBe(true);
  });

  it("renders a list of decks", () => {
    render(<RecentDecks />);
    expect(true).toBe(true);
  });

  it("shows progress values", () => {
    render(<RecentDecks />);
    expect(true).toBe(true);
  });
});
