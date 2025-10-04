/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default variant and size", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("data-slot", "button");
  });

  it("renders with destructive variant", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const btn = container.querySelector("[data-slot='button']");
    expect(btn?.className).toMatch(/bg-destructive/);
  });

  it("renders with large size", () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const btn = container.querySelector("[data-slot='button']");
    expect(btn?.className).toMatch(/h-10/);
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link button" });
    expect(link).toHaveAttribute("data-slot", "button");
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button", { name: "Disabled" });
    expect(btn).toBeDisabled();
  });
});
