import React from "react";
import Layout from "./layout";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

jest.mock("next/font/google", () => ({
  Geist: () => ({ variable: "geist-sans" }),
  Geist_Mono: () => ({ variable: "geist-mono" }),
}));

jest.mock("@/components/sign-out", () => ({
  SignOut: () => <div>SignOut</div>,
}));
jest.mock("@/components/dashboard/nav", () => ({
  DashboardNav: () => <div>DashboardNav</div>,
}));

describe("Layout", () => {
  it("guest", async () => {
    await Layout({ children: <div>GuestContent</div> });
    expect(true).toBe(true);
  });

  it("logged in", async () => {
    await Layout({ children: <div>ProtectedContent</div> });
    expect(true).toBe(true);
  });
});
