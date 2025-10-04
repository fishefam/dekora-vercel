// signup/page.test.tsx
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Minimal mocks
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("./action", () => ({
  signup: jest.fn(),
}));

import { signup } from "./action";
import Page from "./page";

// small helper to control async resolution (for spinner tests)
function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("Signup Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders headings and link", () => {
    render(<Page />);

    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your information to create a Deckora account")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("shows validation errors on empty submit", async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    // Zod + react-hook-form error messages
    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(screen.getByText("Last name is required")).toBeInTheDocument();
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters.")
    ).toBeInTheDocument();
  });

  test("shows 'Passwords do not match' error if mismatch", async () => {
    render(<Page />);

    await userEvent.type(screen.getByLabelText("First name"), "Jane");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "P@ssw0rd!");
    await userEvent.type(screen.getByLabelText("Confirm password"), "different");

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
  });

  test("successful submit calls signup and clears spinner/error", async () => {
    const d = deferred<undefined>();
    (signup as jest.Mock).mockReturnValueOnce(d.promise);

    render(<Page />);

    await userEvent.type(screen.getByLabelText("First name"), "Jane");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "P@ssw0rd!");
    await userEvent.type(screen.getByLabelText("Confirm password"), "P@ssw0rd!");

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    // spinner should show while promise pending
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toContainHTML("animate-spin");

    // resolve as success (no error string)
    d.resolve(undefined);

    await waitFor(() => {
      // spinner gone
      expect(
        screen.getByRole("button", { name: /create account/i })
      ).not.toContainHTML("animate-spin");
    });

    expect(signup).toHaveBeenCalledWith({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "P@ssw0rd!",
      confirmPassword: "P@ssw0rd!",
    });

    // no error text rendered
    expect(
      screen.queryByText(/text-destructive/i)
    ).not.toBeInTheDocument();
  });

  test("failed submit renders server error", async () => {
    (signup as jest.Mock).mockResolvedValueOnce("Email already in use");

    render(<Page />);

    await userEvent.type(screen.getByLabelText("First name"), "Jane");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "P@ssw0rd!");
    await userEvent.type(screen.getByLabelText("Confirm password"), "P@ssw0rd!");

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
  });
});
