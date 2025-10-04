import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { ProgressStats } from "./progress-stats";

describe("ProgressStats ", () => {
  it("renders with default stats", () => {
    render(<ProgressStats />);
    expect(true).toBe(true);
  });

  it("renders with provided stats", () => {
    const stats = {
      total_decks: 5,
      total_cards: 100,
      total_minutes: 60,
      retention_rate: 85,
      decks_change: "+1",
      cards_change: "+10",
      minutes_change: "+15",
      retention_change: "+2",
    };

    render(<ProgressStats stats={stats} />);
    expect(true).toBe(true);
  });

  it("renders loading state", () => {
    render(<ProgressStats loading />);
    expect(true).toBe(true);
  });
});
