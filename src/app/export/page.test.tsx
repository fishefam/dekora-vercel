// export/page.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// ---- mocks: server actions ----
const getUserDecksAction = jest.fn(async () => [
  { id: "d1", name: "Alpha", total_cards: 10 },
  { id: "d2", name: "Beta", total_cards: 5 },
]);
const exportDecksGroupedAction = jest.fn(async () => []); // keep empty to avoid Blob/URL work
jest.mock("./action", () => ({
  getUserDecksAction: (...args: any[]) => (getUserDecksAction as any)(...args),
  exportDecksGroupedAction: (...args: any[]) =>
    (exportDecksGroupedAction as any)(...args),
}));

// ---- mocks: UI wrappers ----
jest.mock("@/components/dashboard/shell", () => ({
  DashboardShell: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/dashboard/header", () => ({
  DashboardHeader: ({ heading, text, children }: any) => (
    <header>
      <h1>{heading}</h1>
      <p>{text}</p>
      <div>{children}</div>
    </header>
  ),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, title, className }: any) => (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <section>{children}</section>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children }: any) => <footer>{children}</footer>,
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      id={id}
      type="checkbox"
      aria-label={id}
      checked={!!checked}
      onChange={() => onCheckedChange?.(!checked)}
    />
  ),
}));
jest.mock("@/components/icons", () => ({
  Download: (props: any) => <svg aria-label="download" {...props} />,
}));

// ---- import after mocks ----
import Page from "./page";

describe("Export Page (smoke)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading and loads decks", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /export flashcards/i,
      })
    ).toBeInTheDocument();

    await waitFor(() => expect(getUserDecksAction).toHaveBeenCalled());
    expect(screen.getByText(/alpha \(10\)/i)).toBeInTheDocument();
    expect(screen.getByText(/beta \(5\)/i)).toBeInTheDocument();
  });

  it("enables export when a deck is selected and calls export action", async () => {
    render(<Page />);
    await screen.findByText(/alpha \(10\)/i);

    // initially disabled
    const exportBtn = screen.getByRole("button", {
      name: /export selected decks/i,
    });
    expect(exportBtn).toBeDisabled();

    // select first deck
    const checkbox = screen.getByLabelText("deck-d1");
    fireEvent.click(checkbox);

    expect(exportBtn).toBeEnabled();
    fireEvent.click(exportBtn);

    await waitFor(() =>
      expect(exportDecksGroupedAction).toHaveBeenCalledWith(["d1"])
    );
    expect(true).toBe(true);
  });
});
