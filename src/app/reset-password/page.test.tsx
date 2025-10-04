import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

jest.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const comp = ({ href, children, ...rest }: any) =>
    React.createElement("a", { href, ...rest }, children);
  return comp;
});

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <section>{children}</section>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h1>{children}</h1>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <footer>{children}</footer>,
}));
jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) =>
    render({ field: { value: "", onChange: () => {} } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

// mock RHF to simplify submission flow
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: (fn: any) => (e?: any) => {
      e?.preventDefault?.();
      fn({ password: "abcdefgh", confirmPassword: "abcdefgh" });
    },
    control: {},
  }),
}));

// zod resolver is unused by our mocked useForm, but keep an export
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => ({}),
}));

const resetPassword = jest.fn();
jest.mock("./action", () => ({
  resetPassword: (...args: any[]) => (resetPassword as any)(...args),
}));

import Page from "./page";

const submitForm = async () => {
  const btn = await screen.findByRole("button", { name: /reset password/i });
  fireEvent.click(btn);
};

describe("Reset Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default URL with no uid
    window.history.pushState({}, "", "/reset-password");
  });

  it("renders title and submit", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", { name: /set a new password/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows error if uid is missing", async () => {
    render(<Page />);
    await submitForm();
    expect(
      await screen.findByText(
        /missing user id\. please verify and use the link from our email\./i
      )
    ).toBeInTheDocument();
  });

  it("submits and shows success when resetPassword resolves", async () => {
    window.history.pushState({}, "", "/reset-password?uid=abc123");
    resetPassword.mockResolvedValueOnce({});
    render(<Page />);
    await submitForm();
    expect(
      await screen.findByText(/your password has been updated/i)
    ).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledWith({
      password: "abcdefgh",
      confirmPassword: "abcdefgh",
      uid: "abc123",
    });
  });

  it("shows backend error when resetPassword rejects", async () => {
    window.history.pushState({}, "", "/reset-password?uid=abc123");
    resetPassword.mockRejectedValueOnce(new Error("nope"));
    render(<Page />);
    await submitForm();
    expect(await screen.findByText(/nope/i)).toBeInTheDocument();
  });
});
