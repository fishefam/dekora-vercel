// src/components/dashboard/header.test.tsx
import { render, screen } from "@testing-library/react";
import { DashboardHeader } from "./header";

describe("DashboardHeader", () => {
  it("renders heading text", () => {
    render(<DashboardHeader heading="My Dashboard" />);
    expect(screen.getByText("My Dashboard")).toBeInTheDocument();
  });

  it("renders optional text when provided", () => {
    render(<DashboardHeader heading="Hello" text="Welcome message" />);
    expect(screen.getByText("Welcome message")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <DashboardHeader heading="Header">
        <button>Click Me</button>
      </DashboardHeader>
    );
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("renders without text or children", () => {
    render(<DashboardHeader heading="Only Heading" />);
    expect(screen.getByText("Only Heading")).toBeInTheDocument();
  });
});
