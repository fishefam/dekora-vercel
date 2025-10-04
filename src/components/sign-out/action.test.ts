import { signOut } from "./action";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("signOut", () => {
  it("deletes auth cookie and redirects to login", async () => {
    const deleteMock = jest.fn();
    (cookies as jest.Mock).mockResolvedValue({
      delete: deleteMock,
    });

    await signOut();

    expect(deleteMock).toHaveBeenCalledWith("auth");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
