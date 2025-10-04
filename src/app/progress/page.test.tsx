// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// ---- mocks: actions ----
const getProgressSummaryAction = jest.fn(async () => ({
  total_sessions: 5,
  total_cards: 42,
  total_minutes: 123,
  current_streak: 3,
  longest_streak: 7,
  last_studied_at: "2025-09-30T12:00:00Z",
}));
const getOverviewAction = jest.fn(async () => [
  { date: "2025-09-27", cards: 5, sessions: 1, correct_rate: 0.8 },
  { date: "2025-09-28", cards: 7, sessions: 2, correct_rate: 0.7 },
]);
jest.mock("./action", () => ({
  getProgressSummaryAction: (...args: any[]) =>
    (getProgressSummaryAction as any)(...args),
  getOverviewAction: (...args: any[]) => (getOverviewAction as any)(...args),
}));

// ---- mocks: UI wrappers ----
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
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <section className={className}>{children}</section>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));
// Replace shadcn Select with a native <select> that triggers onValueChange
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select
      aria-label="timeframe"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));
// Simple stand-ins for child components that accept props
jest.mock("@/components/dashboard/progress-stats", () => ({
  ProgressStats: ({ stats, loading }: any) => (
    <div data-testid="progress-stats">
      {loading ? "loading" : `sessions:${stats?.total_sessions ?? 0}`}
    </div>
  ),
}));
jest.mock("@/components/dashboard/overview", () => ({
  Overview: ({ series, loading }: any) => (
    <div data-testid="overview">
      {loading ? "loading" : `points:${series?.length ?? 0}`}
    </div>
  ),
}));

// ---- import after mocks ----
import Page from "./page";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Progress Page", () => {
  it('renders header and loads initial data (timeframe "all", overview 7 days)', async () => {
    render(<Page />);

    expect(
      await screen.findByRole("heading", { name: /progress tracking/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getProgressSummaryAction).toHaveBeenCalledWith("all");
      expect(getOverviewAction).toHaveBeenCalledWith(7);
    });

    expect(screen.getByTestId("progress-stats")).toHaveTextContent(
      "sessions:5"
    );
    expect(screen.getByTestId("overview")).toHaveTextContent("points:2");
  });

  it("changes timeframe via select and refetches", async () => {
    render(<Page />);

    await screen.findByTestId("progress-stats");

    const select = screen.getByLabelText("timeframe") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "week" } });

    await waitFor(() => {
      // Called again with the new timeframe
      expect(getProgressSummaryAction).toHaveBeenLastCalledWith("week");
      // Overview still requested for 7 (fixed window)
      expect(getOverviewAction).toHaveBeenLastCalledWith(7);
    });

    expect(true).toBe(true);
  });

  it("shows loading placeholders before data settles", async () => {
    // Make the actions resolve on next tick to see loading state
    getProgressSummaryAction.mockImplementationOnce(
      () =>
        new Promise((res) => setTimeout(() => res({ total_sessions: 1 }), 0))
    );
    getOverviewAction.mockImplementationOnce(
      () =>
        new Promise((res) =>
          setTimeout(
            () => res([{ date: "x", cards: 1, sessions: 1, correct_rate: 1 }]),
            0
          )
        )
    );

    render(<Page />);

    expect(screen.getByTestId("progress-stats")).toHaveTextContent(/loading/i);
    expect(screen.getByTestId("overview")).toHaveTextContent(/loading/i);

    await screen.findByText(/sessions:1/i);
    expect(screen.getByTestId("overview")).toHaveTextContent(/points:1/i);
  });
});
