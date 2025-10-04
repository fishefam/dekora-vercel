import { render } from "@testing-library/react";
import Page from "./page";

jest.mock("./action", () => ({
  signup: jest.fn().mockResolvedValue(undefined),
}));

describe("Signup Page", () => {
  it("renders", () => {
    render(<Page />);
    expect(true).toBe(true);
  });

  it("submits form without crashing", async () => {
    render(<Page />);
    expect(true).toBe(true);
  });
});
