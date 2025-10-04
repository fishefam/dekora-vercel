/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("renders items with correct roles", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("allows selecting a radio option", async () => {
    const user = userEvent.setup();

    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>
    );

    const [radioA, radioB] = screen.getAllByRole("radio");

    expect(radioA).toHaveAttribute("data-state", "checked");
    expect(radioB).toHaveAttribute("data-state", "unchecked");

    await user.click(radioB);
    expect(radioB).toHaveAttribute("data-state", "checked");
    expect(radioA).toHaveAttribute("data-state", "unchecked");
  });

  it("supports disabled state", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" disabled />
      </RadioGroup>
    );

    const radio = screen.getByRole("radio");
    expect(radio).toBeDisabled();
  });
});
