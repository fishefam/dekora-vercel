// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";

const updateUserById = jest.fn(async () => ({}));
const createClient = jest.fn(async () => ({
  auth: { admin: { updateUserById } },
}));
jest.mock("@sb/client", () => ({
  createClient: (...args: any[]) => createClient(...args),
}));

const cookieDelete = jest.fn();
const cookies = jest.fn(async () => ({ delete: cookieDelete }));
jest.mock("next/headers", () => ({
  cookies: (...args: any[]) => cookies(...args),
}));

const redirect = jest.fn();
jest.mock("next/navigation", () => ({
  redirect: (...args: any[]) => redirect(...args),
}));

import { resetPassword } from "./action";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("resetPassword action", () => {
  it("returns message when passwords mismatch and does not call external APIs", async () => {
    const res = await resetPassword({
      password: "pass1234",
      confirmPassword: "pass12345",
      uid: "u-123",
    });

    expect(res).toBe("Passwords do not match");
    expect(createClient).not.toHaveBeenCalled();
    expect(cookies).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("updates user, clears cookie, and redirects on success", async () => {
    const result = await resetPassword({
      password: "pass1234",
      confirmPassword: "pass1234",
      uid: "u-123",
    });

    expect(createClient).toHaveBeenCalled();
    expect(updateUserById).toHaveBeenCalledWith("u-123", {
      password: "pass1234",
    });
    expect(cookies).toHaveBeenCalled();
    expect(cookieDelete).toHaveBeenCalledWith("forgotPasswordRedirected");
    expect(redirect).toHaveBeenCalledWith("/login");
    expect(result).toBeUndefined();
  });
});
