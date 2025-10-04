import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

jest.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const Comp = ({ href, children, ...rest }: any) =>
    React.createElement("a", { href, ...rest }, children);
  return Comp;
});

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <section className={className}>{children}</section>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h1 className={className}>{children}</h1>
  ),
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children, className }: any) => (
    <footer className={className}>{children}</footer>
  ),
}));
jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render, name }: any) =>
    render({
      field: {
        value: name === "remember" ? false : "",
        onChange: () => {},
        onBlur: () => {},
        name,
        disabled: false,
        ref: () => {},
      },
    }),
  FormItem: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, ...rest }: any) => (
    <input
      type="checkbox"
      aria-label="Remember me"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...rest}
    />
  ),
}));

// Simplify RHF + zod
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: (fn: any) => (e?: any) => {
      e?.preventDefault?.();
      fn({
        email: "user@example.com",
        password: "secret123",
        remember: true,
      });
    },
    control: {},
  }),
}));
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => ({}),
}));

const login = jest.fn();
jest.mock("./action", () => ({
  login: (...args: any[]) => (login as any)(...args),
}));

import Page from "./page";

const submit = async () => {
  const btn = await screen.findByRole("button", { name: /sign in/i });
  fireEvent.click(btn);
};

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading and submit button", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", { name: /sign in to deckora/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("submits credentials and shows no error on success", async () => {
    login.mockResolvedValueOnce(undefined); // success -> no error message
    render(<Page />);
    await submit();
    expect(login).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
      remember: true,
    });
    const err = screen.queryByText(/invalid|error|failed/i);
    expect(err).toBeNull();
  });

  it("shows backend error message when login resolves with an error string", async () => {
    login.mockResolvedValueOnce("Invalid credentials");
    render(<Page />);
    await submit();
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("renders the remember me checkbox and forgot link", async () => {
    render(<Page />);
    expect(await screen.findByLabelText(/remember me/i)).toBeInTheDocument();
    const forgot = screen.getByRole("link", { name: /forgot password\?/i });
    expect(forgot).toHaveAttribute("href", "/forgot-password");
  });
});
