/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./card";

describe("Card", () => {
  it("renders with header, content and footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
          <CardDescription>Subtitle</CardDescription>
        </CardHeader>
        <CardContent>Body text</CardContent>
        <CardFooter>Footer text</CardFooter>
      </Card>
    );

    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
    expect(screen.getByText("Footer text")).toBeInTheDocument();
  });

  it("renders action in header", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>With Action</CardTitle>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
      </Card>
    );

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
