// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "@testing-library/jest-dom";

const listUsers = jest.fn(async () => ({ data: { users: [] }, error: null }));
const getUserById = jest.fn(async () => ({
  data: { user: { id: "u1", email: "u1@example.com" } },
  error: null,
}));
const createUser = jest.fn(async () => ({
  data: { user: { id: "new-user-id", email: "grace@example.com" } },
  error: null,
}));
const updateUserById = jest.fn(async () => ({ error: null }));
const deleteUser = jest.fn(async () => ({ error: null }));

const fromUpsert = jest.fn(async () => ({ error: null }));
const fromDeleteEq = jest.fn(async () => ({ error: null }));

// more robust createClient mock that supports chained .from(...).select().in/eq().maybeSingle()
const createClient = jest.fn(() => ({
  auth: {
    admin: {
      listUsers,
      getUserById,
      createUser,
      updateUserById,
      deleteUser,
    },
  },
  from: (_table?: string) => {
    return {
      select: (_sel?: string) => {
        return {
          // .in(...) usage in listUsersAction -> returns { data, error }
          in: async (_col?: string, _vals?: any[]) => ({ data: [], error: null }),
          // .eq(...).maybeSingle() usage in getUserAction
          eq: (_col?: string, _val?: any) => ({
            maybeSingle: async () => ({ data: null, error: null }),
            // in some usages eq may be awaited directly
            then: async (onfulfilled: any) => onfulfilled({ data: null, error: null }),
          }),
          // direct maybeSingle() usage
          maybeSingle: async () => ({ data: null, error: null }),
        };
      },
      // .upsert() usage
      upsert: async (..._args: any[]) => fromUpsert(..._args),
      // .delete().eq(...)
      delete: () => ({ eq: (_col?: string, _val?: any) => fromDeleteEq() }),
    };
  },
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: (...args: any[]) => createClient(...args),
}));

import {
  listUsersAction,
  createUserAction,
  changeRoleAction,
  suspendUserAction,
  deleteUserAction,
} from "./action";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("listUsersAction", () => {
  it("returns empty list when auth.admin.listUsers returns no users", async () => {
    listUsers.mockResolvedValueOnce({ data: { users: [] }, error: null });
    const res = await listUsersAction();
    expect(res.ok).toBe(true);
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data.users)).toBe(true);
    expect(res.data.users.length).toBe(0);
    // default page/perPage should be present
    expect(res.data.page).toBe(1);
    expect(res.data.perPage).toBe(25);
    expect(createClient).toHaveBeenCalled();
  });
});

describe("createUserAction", () => {
  it("creates auth user, upserts profile, returns user row", async () => {
    createUser.mockResolvedValueOnce({
      data: { user: { id: "new-user-id", email: "grace@example.com" } },
      error: null,
    });
    fromUpsert.mockResolvedValueOnce({ error: null });

    const res = await createUserAction({
      email: "grace@example.com",
      full_name: "Grace Hopper",
      role: "curator",
    });

    expect(res.ok).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data.profile?.id ?? res.data.id).toBeDefined();
    // ensure admin createUser was called with email + email_confirm
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "grace@example.com",
        email_confirm: true,
      })
    );
    expect(fromUpsert).toHaveBeenCalled();
    expect(createClient).toHaveBeenCalled();
  });
});

describe("changeRoleAction", () => {
  it("updates auth user_metadata and profile role, returns user", async () => {
    updateUserById.mockResolvedValueOnce({ error: null });
    fromUpsert.mockResolvedValueOnce({ error: null });
    getUserById.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "u1@example.com" } },
      error: null,
    });

    const res = await changeRoleAction({ id: "u1", role: "admin" });
    expect(res.ok).toBe(true);
    expect(updateUserById).toHaveBeenCalledWith("u1", {
      user_metadata: { role: "admin" },
    });
    expect(fromUpsert).toHaveBeenCalled();
    expect(getUserById).toHaveBeenCalled();
  });
});

describe("suspendUserAction", () => {
  it("sets banned_until via admin.updateUserById and returns user", async () => {
    updateUserById.mockResolvedValueOnce({ error: null });
    getUserById.mockResolvedValueOnce({
      data: { user: { id: "u2", email: "u2@example.com" } },
      error: null,
    });

    const res = await suspendUserAction({ id: "u2" });
    expect(res.ok).toBe(true);
    expect(updateUserById).toHaveBeenCalledWith(
      "u2",
      expect.objectContaining({ banned_until: expect.any(String) })
    );
    expect(getUserById).toHaveBeenCalledWith("u2");
  });
});

describe("deleteUserAction", () => {
  it("deletes auth user and profile row", async () => {
    deleteUser.mockResolvedValueOnce({ error: null });
    fromDeleteEq.mockResolvedValueOnce({ error: null });

    const res = await deleteUserAction("u3");
    expect(res.ok).toBe(true);
    expect(deleteUser).toHaveBeenCalledWith("u3");
    expect(fromDeleteEq).toHaveBeenCalled();
    expect(createClient).toHaveBeenCalled();
  });
});