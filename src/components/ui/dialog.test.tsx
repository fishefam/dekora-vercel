/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./dialog";

describe("Dialog", () => {
  it("renders trigger and opens dialog on click", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Some description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    // Initially dialog content should not be visible
    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();

    // Click the trigger
    await user.click(screen.getByRole("button", { name: /open dialog/i }));

    // Dialog content should appear
    expect(await screen.findByText("Dialog Title")).toBeInTheDocument();
    expect(screen.getByText("Some description")).toBeVisible();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Close Me</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: /open dialog/i }));

    const title = await screen.findByText("Close Me");
    expect(title).toBeInTheDocument();

    // Close button has accessible name "Close" from the sr-only span
    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);

    expect(screen.queryByText("Close Me")).not.toBeInTheDocument();
  });

  it("can hide the close button when showCloseButton is false", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>No Close Button</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: /open dialog/i }));

    expect(await screen.findByText("No Close Button")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /close/i })
    ).not.toBeInTheDocument();
  });
});
