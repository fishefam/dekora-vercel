import { cn } from "./utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("handles conditional class names", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });
});
