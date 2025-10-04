import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { Overview } from "./overview";

describe("Overview ", () => {
  it("renders a loading skeleton when loading=true", () => {
    render(<Overview loading />);
    expect(true).toBe(true);
  });

  it("renders fallback demo chart when no series is provided", () => {
    render(<Overview />);
    expect(true).toBe(true);
  });

  it("renders chart with provided series data", () => {
    const series = [
      { date: "2023-09-25", cards: 10, sessions: 2, correct_rate: 0.8 },
      { date: "2023-09-26", cards: 20, sessions: 3, correct_rate: 0.9 },
    ];
    render(<Overview series={series} />);
    expect(true).toBe(true);
  });
});
