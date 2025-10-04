// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";

const getUserIdFromCookie = jest.fn();
jest.mock("@sb/auth", () => ({
  getUserIdFromCookie: (...args: any[]) => getUserIdFromCookie(...args),
}));

// --- Minimal Supabase admin client mock with simple method chains ---
const updateUserById = jest.fn(async () => ({}));
const deleteUser = jest.fn(async () => ({ error: null }));
const createUser = jest.fn(async () => ({
  data: { user: { id: "new-user-id" } },
  error: null,
}));

const fromUpdateEq = jest.fn(async () => ({ error: null }));
const fromDeleteEq = jest.fn(async () => ({ error: null }));
const fromUpsert = jest.fn(async () => ({ error: null }));

const createClient = jest.fn(async () => ({
  auth: { admin: { updateUserById, deleteUser, createUser } },
  from: () => ({
    update: () => ({
      eq: () => fromUpdateEq(),
    }),
    delete: () => ({
      eq: () => fromDeleteEq(),
    }),
    upsert: () => fromUpsert(),
    select: () => ({
      // for getUsersAction if ever exercised further
      order: () => ({
        order: () => ({
          range: () => ({ data: [], error: null }),
        }),
      }),
    }),
  }),
}));
jest.mock("@sb/client", () => ({
  createClient: (...args: any[]) => createClient(...args),
}));

import {
  getUsersAction,
  createUserAction,
  updateUserRoleAction,
  updateUserStatusAction,
  deleteUserAction,
} from "./action";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getUsersAction (unauthenticated)", () => {
  it("returns empty/defaults when no current user", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await getUsersAction();
    expect(res).toEqual({ rows: [], total: 0, page: 1, pageSize: 10 });
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe("createUserAction", () => {
  it("rejects when unauthenticated", async () => {
    getUserIdFromCookie.mockResolvedValueOnce(null);
    const res = await createUserAction({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      role: "admin",
    });
    expect(res.ok).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates auth user, upserts profile, returns id", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("admin-uid");
    const res = await createUserAction({
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      role: "curator",
    });
    expect(createClient).toHaveBeenCalled();
    expect(res).toEqual({ ok: true, id: "new-user-id" });
    expect(createUser).toHaveBeenCalledWith({
      email: "grace@example.com",
      email_confirm: true,
      user_metadata: { full_name: "Grace Hopper" },
      app_metadata: { role: "curator" },
    });
    expect(fromUpsert).toHaveBeenCalled();
  });
});

describe("updateUserRoleAction", () => {
  it("updates role in profiles and auth", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("admin-uid");
    const res = await updateUserRoleAction("u1", "admin");
    expect(res.ok).toBe(true);
    expect(fromUpdateEq).toHaveBeenCalled();
    expect(updateUserById).toHaveBeenCalledWith("u1", {
      app_metadata: { role: "admin" },
    });
  });
});

describe("updateUserStatusAction", () => {
  it("updates status and toggles suspended flag", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("admin-uid");
    const res = await updateUserStatusAction("u2", "suspended");
    expect(res.ok).toBe(true);
    expect(fromUpdateEq).toHaveBeenCalled();
    expect(updateUserById).toHaveBeenCalledWith("u2", {
      app_metadata: { suspended: true },
    });
  });
});

describe("deleteUserAction", () => {
  it("deletes auth user and removes profile", async () => {
    getUserIdFromCookie.mockResolvedValueOnce("admin-uid");
    const res = await deleteUserAction("u3");
    expect(res.ok).toBe(true);
    expect(deleteUser).toHaveBeenCalledWith("u3");
    expect(fromDeleteEq).toHaveBeenCalled();
  });
});
