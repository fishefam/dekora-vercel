/**
 * @jest-environment jsdom
 */

import { render, screen, within } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./table";

describe("Table", () => {
  it("renders table with header, body, footer, and caption", () => {
    render(
      <Table>
        <TableCaption>Test Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Column A</TableHead>
            <TableHead>Column B</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Row 1 A</TableCell>
            <TableCell>Row 1 B</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 2 A</TableCell>
            <TableCell>Row 2 B</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>2 rows</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    // Caption
    expect(screen.getByText("Test Caption")).toBeInTheDocument();

    // Headers
    expect(
      screen.getByRole("columnheader", { name: "Column A" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Column B" })
    ).toBeInTheDocument();

    // Rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // header + 2 body + footer

    // Body: grab tbody explicitly
    const [thead, tbody, tfoot] = screen.getAllByRole("rowgroup");
    expect(within(tbody).getByText("Row 1 A")).toBeInTheDocument();
    expect(within(tbody).getByText("Row 2 B")).toBeInTheDocument();

    // Footer
    expect(within(tfoot).getByText("2 rows")).toBeInTheDocument();
  });

  it("applies custom class names", () => {
    render(
      <Table className="custom-table">
        <TableHeader className="custom-header">
          <TableRow>
            <TableHead className="custom-head">Col</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    expect(screen.getByRole("table")).toHaveClass("custom-table");
    expect(screen.getByRole("rowgroup")).toHaveClass("custom-header");
    expect(screen.getByRole("columnheader")).toHaveClass("custom-head");
  });
});
