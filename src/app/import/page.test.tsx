// import/page.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

const importFlashcardsAction = jest.fn(async () => ({
  ok: true,
  message: "Imported",
}));
jest.mock("./action", () => ({
  importFlashcardsAction: (...args: any[]) =>
    (importFlashcardsAction as any)(...args),
}));

jest.mock("@/components/dashboard/shell", () => ({
  DashboardShell: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/dashboard/header", () => ({
  DashboardHeader: ({ heading, text, children }: any) => (
    <header>
      <h1>{heading}</h1>
      <p>{text}</p>
      <div>{children}</div>
    </header>
  ),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <section>{children}</section>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <footer>{children}</footer>,
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
jest.mock("@/components/icons", () => ({
  Upload: (props: any) => <svg aria-label="upload" {...props} />,
  FileText: (props: any) => <svg aria-label="file-text" {...props} />,
}));

import Page from "./page";

describe("Import Page (smoke)", () => {
  it("renders main page heading", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /import flashcards/i,
      })
    ).toBeInTheDocument();
  });

  it("basic interactions do not throw", async () => {
    render(<Page />);

    // Fill deck name so the Import button becomes enabled later
    const nameInput = screen.getByLabelText(/deck name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "My Deck" } });

    // Click Browse Files button (no actual file selection in this smoke test)
    const browse = screen.getByRole("button", { name: /browse files/i });
    fireEvent.click(browse);

    // Click Import button (allowed even without rows in this smoke test)
    const importBtn = screen.getByRole("button", {
      name: /^import flashcards$/i,
    });
    fireEvent.click(importBtn);

    expect(true).toBe(true);
  });
});
