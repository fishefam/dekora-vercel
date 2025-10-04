import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecksTable } from "./decks-table";
import * as actions from "./decks-table.action";

jest.mock("./decks-table.action", () => ({
  getDecksAction: jest.fn(),
  createDeckAction: jest.fn(),
  updateDeckAction: jest.fn(),
  deleteDeckAction: jest.fn(),
}));

const mockDecks = [
  {
    id: "1",
    name: "Biology",
    cards: 10,
    created_at: new Date().toISOString(),
    last_studied_at: null,
    updated_at: null,
  },
  {
    id: "2",
    name: "Math",
    cards: 5,
    created_at: new Date().toISOString(),
    last_studied_at: null,
    updated_at: null,
  },
  {
    id: "3",
    name: "History",
    cards: 8,
    created_at: new Date().toISOString(),
    last_studied_at: null,
    updated_at: null,
  },
];

describe("DecksTable", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state then decks", async () => {
    (actions.getDecksAction as jest.Mock).mockResolvedValue(mockDecks);

    render(<DecksTable />);

    // Should show header
    expect(screen.getAllByText(/Flashcard Decks/i)[0]).toBeInTheDocument();

    // Wait for decks to load
    await waitFor(() => {
      expect(screen.getAllByText("Biology")[0]).toBeInTheDocument();
    });
  });

  it("can create a new deck", async () => {
    (actions.getDecksAction as jest.Mock).mockResolvedValue([]);
    (actions.createDeckAction as jest.Mock).mockResolvedValue({
      id: "new1",
      name: "Physics",
      cards: 0,
      created_at: new Date().toISOString(),
      last_studied_at: null,
      updated_at: null,
    });

    render(<DecksTable />);

    // Wait for "No decks found" (mobile + desktop version exist, so use all)
    await waitFor(() => {
      expect(screen.getAllByText(/No decks found/i).length).toBeGreaterThan(0);
    });

    await user.click(screen.getByRole("button", { name: /New Deck/i }));
    const input = screen.getByPlaceholderText(/e\.g\., Biology 101/i);
    await user.type(input, "Physics");
    await user.click(screen.getByRole("button", { name: /Create Deck/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Physics")[0]).toBeInTheDocument();
    });
  });

  it("can edit a deck name", async () => {
    (actions.getDecksAction as jest.Mock).mockResolvedValue(mockDecks);
    (actions.updateDeckAction as jest.Mock).mockResolvedValue({
      ...mockDecks[1],
      name: "Advanced Math",
    });

    render(<DecksTable />);

    await waitFor(() => {
      expect(screen.getAllByText("Math")[0]).toBeInTheDocument();
    });

    // Open menu (grab the first "Open menu" button for Math)
    const openMenuBtns = screen.getAllByRole("button", { name: /Open menu/i });
    await user.click(openMenuBtns[0]);
    await user.click(screen.getByText("Edit Deck"));

    const input = screen.getByLabelText(/Name/i);
    await user.clear(input);
    await user.type(input, "Advanced Math");
    await user.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Advanced Math")[0]).toBeInTheDocument();
    });
  });

  it("can delete a deck", async () => {
    (actions.getDecksAction as jest.Mock).mockResolvedValue(mockDecks);
    (actions.deleteDeckAction as jest.Mock).mockResolvedValue({ id: "3" });

    render(<DecksTable />);

    await waitFor(() => {
      expect(screen.getAllByText("History")[0]).toBeInTheDocument();
    });

    // Open menu for History (pick last one since History is last deck)
    const openMenuBtns = screen.getAllByRole("button", { name: /Open menu/i });
    await user.click(openMenuBtns[openMenuBtns.length - 1]);
    await user.click(screen.getByText("Delete Deck"));

    await user.click(screen.getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect(actions.deleteDeckAction).toHaveBeenCalledWith({ id: "3" });
    });
  });
});
