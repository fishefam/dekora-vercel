// src/app/import/page.test.tsx
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ----- Minimal UI & icon mocks -----
jest.mock("@/components/dashboard/shell", () => ({
  DashboardShell: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/dashboard/header", () => ({
  DashboardHeader: ({ heading, text }: any) => (
    <div>
      <h1>{heading}</h1>
      <p>{text}</p>
    </div>
  ),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));
jest.mock("@/components/icons", () => ({
  Upload: (props: any) => <svg data-testid="icon-upload" {...props} />,
  FileText: (props: any) => <svg data-testid="icon-filetext" {...props} />,
}));

// ----- Action mock -----
jest.mock("./action", () => ({
  importFlashcardsAction: jest.fn(),
}));

import Page from "./page";
import { importFlashcardsAction } from "./action";

/** Create a file-like object that has a working .text() and name/type */
function mockFile(name: string, content: string, type = "text/csv") {
  return {
    name,
    type,
    async text() {
      return content;
    },
  } as unknown as File;
}

/** Define the read-only `files` prop on an <input type="file"> and dispatch a change event */
function setFilesAndChange(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, "files", {
    configurable: true,
    get: () =>
      Object.assign([...files], {
        length: files.length,
        item: (i: number) => files[i] ?? null,
      }),
  });
  fireEvent.change(input);
}

describe("Import Flashcards Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header and upload section", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: "Import Flashcards" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upload File" })).toBeInTheDocument();
    expect(screen.getByTestId("icon-upload")).toBeInTheDocument();
    expect(screen.getByTestId("icon-filetext")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /browse files/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Deck Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import flashcards/i })).toBeDisabled();
  });

  test("rejects non-csv file", async () => {
    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bad = mockFile("notes.txt", "front,back\nA,B", "text/plain");

    setFilesAndChange(input, [bad]);

    // shows error
    expect(await screen.findByText("Please upload a .csv file.")).toBeInTheDocument();
    // still disabled
    expect(screen.getByRole("button", { name: /import flashcards/i })).toBeDisabled();
  });

  test("parses CSV with header and imports successfully", async () => {
    (importFlashcardsAction as jest.Mock).mockResolvedValueOnce({
      ok: true,
      message: "Imported 2 rows",
    });

    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csv = [
      "front,back,difficulty",
      `"Hola","Hello",1`,
      `"Gracias","Thank you",3`,
    ].join("\n");
    const f = mockFile("spanish.csv", csv);

    setFilesAndChange(input, [f]);

    // Selected file text appears
    expect(await screen.findByText(/Selected:/i)).toBeInTheDocument();
    expect(screen.getByText(/spanish\.csv/i)).toBeInTheDocument();

    // Preview appears with counts
    expect(await screen.findByText(/Preview \(2 of 2\)/)).toBeInTheDocument();
    expect(screen.getByText("Hola")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Gracias")).toBeInTheDocument();
    expect(screen.getByText("Thank you")).toBeInTheDocument();

    // Provide deck name → enable import
    await userEvent.type(screen.getByLabelText("Deck Name"), "Spanish Basics");
    expect(screen.getByRole("button", { name: /import flashcards/i })).toBeEnabled();

    // Import
    await userEvent.click(screen.getByRole("button", { name: /import flashcards/i }));

    await waitFor(() => {
      expect(importFlashcardsAction).toHaveBeenCalledWith({
        deckName: "Spanish Basics",
        rows: [
          { front: "Hola", back: "Hello", difficulty: 1, position: 1 },
          { front: "Gracias", back: "Thank you", difficulty: 3, position: 2 },
        ],
      });
    });

    // Success message
    expect(await screen.findByText("Imported 2 rows")).toBeInTheDocument();

    // After success the preview and "Selected:" should clear
    await waitFor(() => {
      expect(screen.queryByText(/Preview \(/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
    });
  });

  test("parses CSV without header (front,back only) and validates deck name", async () => {
    (importFlashcardsAction as jest.Mock).mockResolvedValueOnce({
      ok: true,
      message: "Imported.",
    });

    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csv = ["Question 1,Answer 1", "Question 2,Answer 2"].join("\n");
    const f = mockFile("two-cols.csv", csv);

    setFilesAndChange(input, [f]);

    // Preview visible
    expect(await screen.findByText(/Preview \(2 of 2\)/)).toBeInTheDocument();
    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Answer 1")).toBeInTheDocument();

    const importBtn = screen.getByRole("button", { name: /import flashcards/i });
    expect(importBtn).toBeDisabled();

    // Clicking while disabled won't fire; show validation by clicking after enabling path:
    await userEvent.click(importBtn); // no-op but fine
    // Now type deck name
    await userEvent.type(screen.getByLabelText("Deck Name"), "General");
    expect(importBtn).toBeEnabled();
    await userEvent.click(importBtn);

    await waitFor(() => {
      expect(importFlashcardsAction).toHaveBeenCalledWith({
        deckName: "General",
        rows: [
          { front: "Question 1", back: "Answer 1", difficulty: null, position: 1 },
          { front: "Question 2", back: "Answer 2", difficulty: null, position: 2 },
        ],
      });
    });
  });

  test("shows parsing error when CSV is empty", async () => {
    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const f = mockFile("empty.csv", "");

    setFilesAndChange(input, [f]);

    expect(await screen.findByText("The file appears to be empty.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import flashcards/i })).toBeDisabled();
  });

  test("handles action error by showing parsingError", async () => {
    (importFlashcardsAction as jest.Mock).mockRejectedValueOnce(new Error("Boom"));

    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const f = mockFile("ok.csv", ['front,back', '"A","B"'].join("\n"));

    setFilesAndChange(input, [f]);

    await userEvent.type(screen.getByLabelText("Deck Name"), "Test");
    await userEvent.click(screen.getByRole("button", { name: /import flashcards/i }));

    expect(await screen.findByText("Boom")).toBeInTheDocument();
  });
});
