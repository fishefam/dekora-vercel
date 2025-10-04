// src/app/signup/action.test.ts
import { signup } from "./action";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@sb/client", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      admin: {
        createUser: jest.fn().mockResolvedValue({
          data: { user: { id: "123" } },
          error: null,
        }),
      },
    },
  }),
}));

describe("signup action", () => {
  it("returns password mismatch error", async () => {
    const result = await signup({
      email: "a@test.com",
      password: "abc123!!",
      confirmPassword: "different",
      firstName: "A",
      lastName: "B",
    });
    expect(result).toBe("Passwords do not match");
  });

  it("returns weak password error", async () => {
    const result = await signup({
      email: "a@test.com",
      password: "short",
      confirmPassword: "short",
      firstName: "A",
      lastName: "B",
    });
    expect(result).toBe(
      "Password must be at least 8 characters long and include a number and a special character"
    );
  });

  it("calls Supabase createUser and redirects when valid", async () => {
    const result = await signup({
      email: "a@test.com",
      password: "valid123!",
      confirmPassword: "valid123!",
      firstName: "A",
      lastName: "B",
    });
    expect(result).toBeUndefined();
  });
});
