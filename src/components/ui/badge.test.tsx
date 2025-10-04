/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText("Default")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute("data-slot", "badge")
  })

  it("renders with secondary variant", () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>)
    const badge = container.querySelector("[data-slot='badge']")
    expect(badge?.className).toMatch(/bg-secondary/)
  })

  it("renders with destructive variant", () => {
    const { container } = render(<Badge variant="destructive">Danger</Badge>)
    const badge = container.querySelector("[data-slot='badge']")
    expect(badge?.className).toMatch(/bg-destructive/)
  })

  it("renders as child element when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/test">Link badge</a>
      </Badge>
    )
    const link = screen.getByRole("link", { name: "Link badge" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("data-slot", "badge")
  })
})
