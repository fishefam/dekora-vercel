import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// ---- mocks: actions ----
const mockDecks = [{ id: "d1", name: "Deck 1", total_cards: 4 }];
const mockCards = [
  { id: "c1", front: "F1", back: "B1", difficulty: 1 },
  { id: "c2", front: "F2", back: "B2", difficulty: 2 },
  { id: "c3", front: "F3", back: "B3", difficulty: 3 },
  { id: "c4", front: "F4", back: "B4", difficulty: 4 },
];

jest.mock("./page.action", () => ({
  getDecksForReviewAction: jest.fn(async () => mockDecks),
  getDeckCardsAction: jest.fn(async () => mockCards),
  recordStudyEventAction: jest.fn(async () => ({})),
}));

// ---- mocks: UI primitives ----
jest.mock("@/components/dashboard/shell", () => ({
  DashboardShell: ({ children }: any) => (
    <div data-testid="shell">{children}</div>
  ),
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
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
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
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <footer>{children}</footer>,
}));
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button type="button">{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/dashboard/flashcard", () => ({
  Flashcard: ({ front, back, flipped }: any) => (
    <div data-testid="flashcard">
      <div>{flipped ? back : front}</div>
    </div>
  ),
}));
jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <button type="button">{children}</button>,
}));
jest.mock("@/components/icons", () => ({
  Shuffle: (props: any) => <svg aria-label="shuffle" {...props} />,
}));

// ---- import after mocks ----
import Page from "./page";

describe("Review Page", () => {
  it("renders header and first card", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", { name: /review/i })
    ).toBeInTheDocument();
    expect(await screen.findByText(/card 1 of 4/i)).toBeInTheDocument();
    expect(screen.getByTestId("flashcard")).toHaveTextContent("F1");
  });

  it("shows quiz section and submit button is present", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", { name: /quiz mode/i })
    ).toBeInTheDocument();
    const submit = await screen.findByRole("button", {
      name: /submit answer/i,
    });
    expect(submit).toBeInTheDocument();
  });

  it("allows navigation/shuffle interactions without crashing", async () => {
    render(<Page />);
    await screen.findByText(/card 1 of 4/i);

    const next = screen.getByRole("button", { name: /next/i });
    fireEvent.click(next);

    const prev = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prev);

    const shuffle = screen.getByRole("button", { name: /shuffle/i });
    fireEvent.click(shuffle);

    expect(true).toBe(true);
  });
});
