/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";

// A helper form component for testing
function TestForm({ onSubmit }: { onSubmit?: (data: any) => void }) {
  const form = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit ?? (() => {}))}>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input type="text" placeholder="Email" {...field} />
              </FormControl>
              <FormDescription>Enter your email address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("renders label, input, and description", () => {
    render(<TestForm />);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
  });

  it("shows error message when field is invalid", async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    // Submit without filling the field
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    // Input should have aria-invalid="true"
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("calls onSubmit with valid data", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<TestForm onSubmit={handleSubmit} />);

    const input = screen.getByPlaceholderText("Email");
    await user.type(input, "test@example.com");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith(
      { email: "test@example.com" },
      expect.anything()
    );
  });
});
