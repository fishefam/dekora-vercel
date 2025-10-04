/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders unchecked by default", () => {
    render(<Checkbox aria-label="accept terms" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("toggles state when clicked", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="subscribe" />);
    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("can be disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox disabled aria-label="disabled option" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
