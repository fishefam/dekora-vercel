/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu";
import React from "react";

describe("DropdownMenu", () => {
  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // menu items not visible initially
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();

    // open menu
    await user.click(screen.getByRole("button", { name: /open menu/i }));

    // now items should be visible
    expect(await screen.findByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeVisible();
  });

  it("can toggle a checkbox item", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <StatefulCheckboxItem>Accept</StatefulCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole("button", { name: /open/i }));
    const item = await screen.findByRole("menuitemcheckbox");

    expect(item).toHaveAttribute("aria-checked", "false");
    await user.click(item);
    expect(item).toHaveAttribute("aria-checked", "true");
  });

  it("can select a radio item", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Choose</DropdownMenuTrigger>
        <DropdownMenuContent>
          <StatefulRadioGroup />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole("button", { name: /choose/i }));

    const optionA = await screen.findByRole("menuitemradio", {
      name: "Option A",
    });
    const optionB = screen.getByRole("menuitemradio", { name: "Option B" });

    expect(optionA).toHaveAttribute("aria-checked", "false");
    expect(optionB).toHaveAttribute("aria-checked", "false");

    await user.click(optionB);
    expect(optionB).toHaveAttribute("aria-checked", "true");
  });

  it("opens a submenu when subtrigger is hovered/clicked", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>More</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole("button", { name: /more/i }));
    await user.click(await screen.findByRole("menuitem", { name: /submenu/i }));

    expect(await screen.findByText("Sub Item")).toBeInTheDocument();
  });
});

// inside dropdown-menu.test.tsx
function StatefulCheckboxItem({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = React.useState(false);
  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      onCheckedChange={(val) => setChecked(!!val)}
    >
      {children}
    </DropdownMenuCheckboxItem>
  );
}

function StatefulRadioGroup() {
  const [value, setValue] = React.useState("");
  return (
    <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
      <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}
