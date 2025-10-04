/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

describe("Alert", () => {
  it("renders with default variant", () => {
    render(
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>Neutral alert</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/heads up!/i)).toBeVisible();
    expect(screen.getByText(/neutral alert/i)).toBeVisible();
  });

  it("applies destructive variant styles", () => {
    const { container } = render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something failed</AlertDescription>
      </Alert>
    );

    const alert = container.querySelector("[data-slot='alert']");
    expect(alert).toHaveClass("text-destructive");
  });
});
