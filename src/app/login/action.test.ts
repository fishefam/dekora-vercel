// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

const signInWithPassword = jest.fn();
const createClient = jest.fn(async () => ({
  auth: { signInWithPassword },
}));
jest.mock("@sb/client", () => ({
  createClient: (...args: any[]) => createClient(...args),
}));

const revalidatePath = jest.fn();
jest.mock("next/cache", () => ({
  revalidatePath: (...args: any[]) => revalidatePath(...args),
}));

const redirect = jest.fn();
jest.mock("next/navigation", () => ({
  redirect: (...args: any[]) => redirect(...args),
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

import { login } from "./action";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "secret";
});

describe("login action", () => {
  it("returns wrongCred for invalid credentials error", async () => {
    signInWithPassword.mockResolvedValueOnce({
      error: new Error("Invalid login credentials"),
      data: null,
    });

    const res = await login({
      email: "x@y.com",
      password: "pwd",
      remember: false,
    });

    expect(res).toBe("Wrong email or password");
    expect(cookieSet).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns unknown for non-credential errors", async () => {
    signInWithPassword.mockResolvedValueOnce({
      error: new Error("Database unavailable"),
      data: null,
    });

    const res = await login({
      email: "x@y.com",
      password: "pwd",
      remember: false,
    });

    expect(res).toBe(
      "Something wrong with our server. Please try again later."
    );
    expect(cookieSet).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("sets auth cookie without maxAge when remember is false and redirects", async () => {
    signInWithPassword.mockResolvedValueOnce({
      error: null,
      data: { user: { id: "u1" } },
    });

    await login({ email: "x@y.com", password: "pwd", remember: false });

    expect(cookies).toHaveBeenCalled();
    const [name, value, opts] = cookieSet.mock.calls[0];
    expect(name).toBe("auth");
    expect(typeof value).toBe("string");
    expect(opts).toMatchObject({
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    expect(opts.maxAge).toBeUndefined();

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("sets auth cookie with long maxAge when remember is true", async () => {
    signInWithPassword.mockResolvedValueOnce({
      error: null,
      data: { user: { id: "u2" } },
    });

    await login({ email: "x@y.com", password: "pwd", remember: true });

    const opts = cookieSet.mock.calls[0][2];
    expect(opts.maxAge).toBe(60 * 60 * 24 * 365);
  });
});
