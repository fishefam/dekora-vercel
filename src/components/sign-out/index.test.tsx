import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignOut } from ".";

jest.mock("./action", () => ({
  signOut: jest.fn(),
}));
import { signOut } from "./action";

describe("SignOut", () => {
  it("renders Logout link", () => {
    render(<SignOut />);
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it("calls signOut when clicked", async () => {
    render(<SignOut />);
    const user = userEvent.setup();
    const link = screen.getByText(/logout/i);
    await user.click(link);
    expect(signOut).toHaveBeenCalled();
  });
});
