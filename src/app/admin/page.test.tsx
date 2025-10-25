import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

const listUsersAction = jest.fn(async () => ({
  ok: true,
  data: { users: [] },
}));
const createUserAction = jest.fn(async () => ({ ok: true }));
const getUserAction = jest.fn(async () => ({ ok: true, data: {} }));
const updateUserAction = jest.fn(async () => ({ ok: true }));
const changeRoleAction = jest.fn(async () => ({ ok: true }));
const suspendUserAction = jest.fn(async () => ({ ok: true }));
const deleteUserAction = jest.fn(async () => ({ ok: true }));

jest.mock("./action", () => ({
  listUsersAction: (...args: any[]) => (listUsersAction as any)(...args),
  createUserAction: (...args: any[]) => (createUserAction as any)(...args),
  getUserAction: (...args: any[]) => (getUserAction as any)(...args),
  updateUserAction: (...args: any[]) => (updateUserAction as any)(...args),
  changeRoleAction: (...args: any[]) => (changeRoleAction as any)(...args),
  suspendUserAction: (...args: any[]) => (suspendUserAction as any)(...args),
  deleteUserAction: (...args: any[]) => (deleteUserAction as any)(...args),
}));

// mock deck moderation actions the page imports
jest.mock("./deck-moderation.action", () => ({
  listDecksAction: jest.fn(async () => ({ ok: true, data: { decks: [] } })),
  approveDeckAction: jest.fn(async () => ({ ok: true })),
  setDeckReviewAction: jest.fn(async () => ({ ok: true })),
  blockDeckAction: jest.fn(async () => ({ ok: true })),
  unblockDeckAction: jest.fn(async () => ({ ok: true })),
  deleteDeckAction: jest.fn(async () => ({ ok: true })),
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
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    className,
    title,
    type,
  }: any) => (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      title={title}
    >
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <section>{children}</section>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, ...rest }: any) => (
    <input value={value} onChange={onChange} {...rest} />
  ),
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));
jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, colSpan, className }: any) => (
    <td colSpan={colSpan} className={className}>
      {children}
    </td>
  ),
}));
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @next/next/no-img-element
  AvatarImage: ({ alt }: any) => <img alt={alt} />,
  AvatarFallback: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select
      aria-label="role-select"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, id, defaultChecked }: any) => (
    <input
      id={id}
      type="checkbox"
      aria-label={id}
      checked={!!checked || !!defaultChecked}
      onChange={() => onCheckedChange?.(!checked)}
    />
  ),
}));
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h3>{children}</h3>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));
jest.mock(
  "@/components/icons",
  () => new Proxy({}, { get: () => (props: any) => <svg {...props} /> })
);

import Page from "./page";

describe("Admin Page (smoke)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading and table header (no users)", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", { level: 1, name: /admin dashboard/i })
    ).toBeInTheDocument();

    // initial load should call listUsersAction once
    await waitFor(() => expect(listUsersAction).toHaveBeenCalledTimes(1));

    // table header exists and there are no data rows (only header row present)
    const rows = screen.getAllByRole("row");
    // one header row only
    expect(rows.length).toBe(1);
  });

  it("typing in search and toggling role filter do NOT trigger server reloads", async () => {
    render(<Page />);

    // initial load
    await waitFor(() => expect(listUsersAction).toHaveBeenCalledTimes(1));

    // type in search input (component filters client-side)
    const search = screen.getByPlaceholderText(/search users/i);
    fireEvent.change(search, { target: { value: "ada" } });

    // click the Filters button
    const filterBtn = screen.getByRole("button", { name: /^filters?$/i });
    fireEvent.click(filterBtn);

    // toggle a checkbox to change filters
    const roleBox = screen.getByLabelText("filter-admin");
    fireEvent.click(roleBox);

    // since current page filters client-side, listUsersAction should NOT be called again
    await waitFor(() => expect(listUsersAction).toHaveBeenCalledTimes(1));
  });

  it("opens add user dialog and calls create action", async () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /add user/i }));

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Grace" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Hopper" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "grace@example.com" },
    });

    const roleSelect = screen.getByLabelText("role-select") as HTMLSelectElement;
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    fireEvent.click(screen.getByRole("button", { name: /create user/i }));
    await waitFor(() => expect(createUserAction).toHaveBeenCalledTimes(1));

    // create triggers refreshList which calls listUsersAction again
    await waitFor(() => expect(listUsersAction).toHaveBeenCalledTimes(2));
  });
});
