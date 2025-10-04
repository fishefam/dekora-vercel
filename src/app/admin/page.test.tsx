import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

const getUsersAction = jest.fn(async () => ({ rows: [], total: 0, page: 1 }));
const createUserAction = jest.fn(async () => ({ ok: true }));
const updateUserRoleAction = jest.fn(async () => ({}));
const updateUserStatusAction = jest.fn(async () => ({}));
const deleteUserAction = jest.fn(async () => ({}));

jest.mock("./action", () => ({
  getUsersAction: (...args: any[]) => (getUsersAction as any)(...args),
  createUserAction: (...args: any[]) => (createUserAction as any)(...args),
  updateUserRoleAction: (...args: any[]) =>
    (updateUserRoleAction as any)(...args),
  updateUserStatusAction: (...args: any[]) =>
    (updateUserStatusAction as any)(...args),
  deleteUserAction: (...args: any[]) => (deleteUserAction as any)(...args),
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
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      id={id}
      type="checkbox"
      aria-label={id}
      checked={!!checked}
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

  it("renders heading and empty state", async () => {
    render(<Page />);
    expect(
      await screen.findByRole("heading", { level: 1, name: /admin dashboard/i })
    ).toBeInTheDocument();
    expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
  });

  it("search + filter triggers reloads (no fragile action clicks)", async () => {
    render(<Page />);

    // initial load
    await screen.findByText(/no users found/i);
    expect(getUsersAction).toHaveBeenCalledTimes(1);

    // type in search input (debounced in component)
    const search = screen.getByPlaceholderText(/search users/i);
    fireEvent.change(search, { target: { value: "ada" } });

    // click the exact Filter button (not the labels)
    const filterBtn = screen.getByRole("button", { name: /^filter$/i });
    fireEvent.click(filterBtn);

    // toggle a checkbox to change filters
    const roleBox = screen.getByLabelText("filter-admin");
    fireEvent.click(roleBox);

    await waitFor(() => expect(getUsersAction).toHaveBeenCalledTimes(2));
    expect(true).toBe(true);
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

    const roleSelect = screen.getByLabelText(
      "role-select"
    ) as HTMLSelectElement;
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    fireEvent.click(screen.getByRole("button", { name: /create user/i }));
    await waitFor(() => expect(createUserAction).toHaveBeenCalled());
    expect(true).toBe(true);
  });
});
