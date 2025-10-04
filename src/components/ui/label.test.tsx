/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label", () => {
  it("renders with children", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Username")).toHaveAttribute("data-slot", "label");
  });

  it("associates with input using htmlFor", () => {
    render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" />
      </div>
    );

    const label = screen.getByText("Username");
    expect(label).toHaveAttribute("for", "username");
  });

  it("applies custom className", () => {
    render(<Label className="custom-class">Email</Label>);
    const label = screen.getByText("Email");
    expect(label.className).toMatch(/custom-class/);
  });

  it("respects disabled styles via group-data and peer", () => {
    render(
      <div data-disabled="true">
        <Label>Email</Label>
      </div>
    );
    const label = screen.getByText("Email");

    // Look for the generated class fragment
    expect(label.className).toMatch(
      /group-data-\[disabled=true\]:pointer-events-none/
    );
    expect(label.className).toMatch(/peer-disabled:cursor-not-allowed/);
  });
});
