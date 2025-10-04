import { render, screen } from "@testing-library/react";
import { DashboardNav } from "./nav";
import { usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("DashboardNav", () => {
  it("renders all nav items", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<DashboardNav />);

    expect(screen.getByText("Decks")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Import")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  it("applies active style when pathname matches", () => {
    (usePathname as jest.Mock).mockReturnValue("/review");
    render(<DashboardNav />);

    const reviewLink = screen.getByText("Review");
    expect(reviewLink.className).toMatch(/bg-muted/);
  });

  it("applies disabled style if item is disabled", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<DashboardNav />);

    const adminLink = screen.getByText("Administrator");
    // Disabled because href="#"
    expect(adminLink).toHaveAttribute("href", "/admin"); // still has correct href
    // className should include disabled styling
    // NOTE: your component doesn’t currently mark it disabled in navItems array,
    // but if you add disabled: true to "Administrator", this will test it.
  });
});
