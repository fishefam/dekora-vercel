// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";

// Polyfill TextEncoder for Node test envs
import { TextEncoder, TextDecoder } from "util";
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// ---- mocks ----
const rpc = jest.fn();
const resetPasswordForEmail = jest.fn();
const createClient = jest.fn(async () => ({
  rpc,
  auth: { resetPasswordForEmail },
}));
jest.mock("@sb/client", () => ({
  createClient: (...args: any[]) => createClient(...args),
}));

const cookieSet = jest.fn();
const cookies = jest.fn(async () => ({ set: cookieSet }));
jest.mock("next/headers", () => ({
  cookies: (...args: any[]) => cookies(...args),
}));

jest.mock("jose", () => ({
  SignJWT: class SignJWT {
    constructor() {}
    setProtectedHeader() {
      return this;
    }
    async sign() {
      return "mock.jwt.token";
    }
  },
}));

import { forgotPassword } from "./action";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "secret";
  process.env.BASE_URL = "https://example.com";
});

describe("forgotPassword action (smoke)", () => {
  it('returns "User not found" when lookup yields no id', async () => {
    rpc.mockResolvedValueOnce({ data: [] });
    const res = await forgotPassword({ email: "none@example.com" });
    expect(res).toBe("User not found");
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("returns generic server error when resetPasswordForEmail fails", async () => {
    rpc.mockResolvedValueOnce({ data: [{ id: "u1" }] });
    resetPasswordForEmail.mockResolvedValueOnce({ error: { message: "boom" } });

    const res = await forgotPassword({ email: "user@example.com" });
    expect(resetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
      redirectTo: "https://example.com/reset-password?uid=u1",
    });
    expect(res).toBe(
      "Something wrong with our server. Please try again later."
    );
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("sets cookie on success", async () => {
    rpc.mockResolvedValueOnce({ data: [{ id: "u2" }] });
    resetPasswordForEmail.mockResolvedValueOnce({ error: null });

    const result = await forgotPassword({ email: "ok@example.com" });
    expect(result).toBeUndefined();

    expect(cookieSet).toHaveBeenCalledTimes(1);
    const [name, value, opts] = cookieSet.mock.calls[0];
    expect(name).toBe("forgotPasswordRedirected");
    expect(typeof value).toBe("string");
    expect(opts).toMatchObject({
      httpOnly: true,
      sameSite: true,
      secure: true,
      path: "/",
    });
  });
});
