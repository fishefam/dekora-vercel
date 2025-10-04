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
        value: "",
        onChange: () => {},
        onBlur: () => {},
        name,
        disabled: false,
        ref: () => {},
      },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: (fn: any) => (e?: any) => {
      e?.preventDefault?.();
      fn({ email: "user@example.com" });
    },
    control: {},
  }),
}));
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => ({}),
}));

const forgotPassword = jest.fn();
jest.mock("./action", () => ({
  forgotPassword: (...args: any[]) => (forgotPassword as any)(...args),
}));

import Page from "./page";

const submit = async () => {
  const btn = await screen.findByRole("button", { name: /send reset link/i });
  fireEvent.click(btn);
};

describe("Forgot Password Page (smoke)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", { name: /reset your password/i })
    ).toBeInTheDocument();
  });

  it("submits and shows confirmation text", async () => {
    forgotPassword.mockResolvedValueOnce(undefined);
    render(<Page />);
    await submit();
    expect(forgotPassword).toHaveBeenCalledWith({ email: "user@example.com" });

    // Look for the specific confirmation paragraph to avoid ambiguity
    const confirmation = await screen.findByText(
      /if an account exists for that email, we'?ve sent a password reset link\./i
    );
    expect(confirmation).toBeInTheDocument();
  });
});
