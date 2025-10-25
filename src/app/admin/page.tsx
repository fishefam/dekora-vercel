"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Eye,
  Filter,
  Lock,
  MoreHorizontal,
  PenLine,
  Search,
  Shield,
  Trash2,
  Unlock,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  listDecksAction,
  approveDeckAction,
  setDeckReviewAction,
  blockDeckAction,
  unblockDeckAction,
  deleteDeckAction,
} from "./deck-moderation.action";
import {
  listUsersAction,
  createUserAction,
  getUserAction,
  updateUserAction,
  changeRoleAction,
  suspendUserAction,
  deleteUserAction,
} from "./action";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";

export default function AdminDashboardPage() {
  // ...existing user-management state/hooks...
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("");
  const [perPage] = useState<number>(100);
  const [page] = useState<number>(1);

  // --- filter state (users) ---
  const [roleFilters, setRoleFilters] = useState({
    admin: false,
    user: false,
  });
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    inactive: false,
    suspended: false,
  });

  // --- filter state (decks/content) ---
  const [deckFilters, setDeckFilters] = useState({
    published: false,
    review: false,
    blocked: false,
    reported: false,
  });

  // --- decks state (connected to deck-moderation.action.ts) ---
  const [decksList, setDecksList] = useState<any[]>([]);
  const [decksLoading, setDecksLoading] = useState(false);
  const [decksError, setDecksError] = useState<string | null>(null);

  // --- add user form state ---
  const [addOpen, setAddOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // --- action modals / selection ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState({
    id: "",
    email: "",
    full_name: "",
    avatar_url: "",
    status: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [roleOpen, setRoleOpen] = useState(false);
  const [roleState, setRoleState] = useState<{ id: string; role: string }>({
    id: "",
    role: "user",
  });
  const [changingRole, setChangingRole] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "delete";
    id: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // fetch users (unchanged)
  useEffect(() => {
    let mounted = true;
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await listUsersAction({ perPage, page });
        if (!mounted) return;
        if (res.ok) {
          const capitalize = (s?: string | null) =>
            s && s.length ? s[0].toUpperCase() + s.slice(1) : "User";

          const mapped = res.data.users.map((u: any) => {
            const profile = u.profile ?? {};
            const rawFirst = (u as any).raw_user_meta_data?.firstName ?? "";
            const rawLast = (u as any).raw_user_meta_data?.lastName ?? "";
            const rawFull = `${rawFirst} ${rawLast}`.trim();
            const name = profile.full_name ?? rawFull ?? u.email ?? u.id;
            const email = u.email ?? profile.email ?? "";
            const avatar = profile.avatar_url ?? undefined;
            const role = capitalize(profile.role ?? "user");
            const lastActiveRaw =
              profile.last_active_at ?? u.last_sign_in_at ?? null;
            const lastActive = lastActiveRaw
              ? new Date(lastActiveRaw).toLocaleString()
              : "-";
            const joined = u.created_at
              ? new Date(u.created_at).toLocaleDateString()
              : "-";
            const decksCount =
              typeof u.decks_count === "number" ? u.decks_count : 0;
            return {
              id: u.id,
              avatar,
              name,
              email,
              rawFull,
              role,
              lastActive,
              decks: decksCount,
              joined,
            };
          });
          setUsers(mapped);
        } else {
          setError(res.error ?? "Failed to load users");
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, [perPage, page]);

  // helpers
  const refreshList = async () => {
    setLoading(true);
    try {
      const res = await listUsersAction({ perPage, page });
      if (res.ok) {
        const capitalize = (s?: string | null) =>
          s && s.length ? s[0].toUpperCase() + s.slice(1) : "User";
        setUsers(
          res.data.users.map((u: any) => {
            const profile = u.profile ?? {};
            const rawFirst = (u as any).raw_user_meta_data?.firstName ?? "";
            const rawLast = (u as any).raw_user_meta_data?.lastName ?? "";
            const rawFull = `${rawFirst} ${rawLast}`.trim();
            const name = profile.full_name ?? rawFull ?? u.email ?? u.id;
            const email = u.email ?? profile.email ?? "";
            const avatar = profile.avatar_url ?? undefined;
            const role = capitalize(profile.role ?? "user");
            const lastActiveRaw =
              profile.last_active_at ?? u.last_sign_in_at ?? null;
            const lastActive = lastActiveRaw
              ? new Date(lastActiveRaw).toLocaleString()
              : "-";
            const joined = u.created_at
              ? new Date(u.created_at).toLocaleDateString()
              : "-";
            const decksCount =
              typeof u.decks_count === "number" ? u.decks_count : 0;
            return {
              id: u.id,
              avatar,
              name,
              email,
              rawFull,
              role,
              lastActive,
              decks: decksCount,
              joined,
            };
          })
        );
      } else {
        setError(res.error ?? "Failed to load users");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // compose filtered users using query + filters (unchanged)
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedRoles = Object.entries(roleFilters)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const selectedStatuses = Object.entries(statusFilters)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return users.filter((u) => {
      if (
        q &&
        !(
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.id ?? "").toLowerCase().includes(q) ||
          (u.name ?? "").toLowerCase().includes(q)
        )
      ) {
        return false;
      }

      if (selectedRoles.length > 0) {
        const userRole = (u.role ?? "user").toLowerCase();
        if (!selectedRoles.includes(userRole)) return false;
      }

      if (selectedStatuses.length > 0) {
        const userStatus = (u.status ?? "inactive").toLowerCase();
        if (!selectedStatuses.includes(userStatus)) return false;
      }

      return true;
    });
  }, [users, query, roleFilters, statusFilters]);

  // Deck moderation: build status param from deckFilters (prefer single selection)
  function getDeckStatusFromFilters() {
    const s = Object.entries(deckFilters)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (s.length === 1) return s[0] as any;
    // if multiple or none selected, return undefined to fetch all
    return undefined;
  }

  const [deckQuery, setDeckQuery] = useState<string>("");

  // fetch decks (calls server action)
  useEffect(() => {
    let mounted = true;
    async function fetchDecks() {
      setDecksLoading(true);
      setDecksError(null);
      try {
        const status = getDeckStatusFromFilters();
        const res = await listDecksAction({
          perPage: 50,
          page: 1,
          query: deckQuery ?? undefined,
          status,
        });
        if (!mounted) return;
        if (!res.ok) {
          setDecksError(res.error ?? "Failed to load decks");
          setDecksList([]);
          return;
        }
        const mapped = res.data.decks.map((d: any) => {
          const creatorName =
            d.creator?.full_name ?? d.creator?.email ?? "Unknown";
          const creatorEmail = d.creator?.email ?? "";
          // Keep status flags on the raw object; remove displayed status column
          return {
            id: d.id,
            name: d.name,
            description: d.description,
            creatorName,
            creatorEmail,
            flashcards_count: d.flashcards_count ?? 0,
            is_public: Boolean(d.is_public),
            is_archived: Boolean(d.is_archived),
            study_count: d.study_count ?? 0,
            created_at: d.created_at,
            updated_at: d.updated_at,
            reported: Boolean(d.reported),
            raw: d,
          };
        });
        setDecksList(mapped);
      } catch (e: any) {
        setDecksError(e?.message ?? "Failed to load decks");
        setDecksList([]);
      } finally {
        if (mounted) setDecksLoading(false);
      }
    }

    fetchDecks();
    return () => {
      mounted = false;
    };
  }, [deckFilters, deckQuery]);

  // deck moderation actions
  async function handleApprove(deckId: string) {
    setDecksLoading(true);
    try {
      const res = await approveDeckAction(deckId);
      if (!res.ok) setDecksError(res.error ?? "Failed to approve");
      await Promise.resolve(); // allow re-render
    } finally {
      // refresh
      const status = getDeckStatusFromFilters();
      const r = await listDecksAction({ perPage: 50, page: 1, status });
      if (r.ok) {
        const mapped = r.data.decks.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          creatorName: d.creator?.full_name ?? d.creator?.email ?? "Unknown",
          creatorEmail: d.creator?.email ?? "",
          flashcards_count: d.flashcards_count ?? 0,
          statusLabel: d.is_archived
            ? "Blocked"
            : d.is_public
            ? "Published"
            : "Under Review",
          is_public: Boolean(d.is_public),
          is_archived: Boolean(d.is_archived),
          study_count: d.study_count ?? 0,
          created_at: d.created_at,
          updated_at: d.updated_at,
          reported: Boolean(d.reported),
          raw: d,
        }));
        setDecksList(mapped);
      }
      setDecksLoading(false);
    }
  }

  async function handleSetReview(deckId: string) {
    setDecksLoading(true);
    try {
      const res = await setDeckReviewAction(deckId);
      if (!res.ok) setDecksError(res.error ?? "Failed to set review");
    } finally {
      const status = getDeckStatusFromFilters();
      const r = await listDecksAction({ perPage: 50, page: 1, status });
      if (r.ok) {
        setDecksList(
          r.data.decks.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            creatorName: d.creator?.full_name ?? d.creator?.email ?? "Unknown",
            creatorEmail: d.creator?.email ?? "",
            flashcards_count: d.flashcards_count ?? 0,
            statusLabel: d.is_archived
              ? "Blocked"
              : d.is_public
              ? "Published"
              : "Under Review",
            is_public: Boolean(d.is_public),
            is_archived: Boolean(d.is_archived),
            study_count: d.study_count ?? 0,
            created_at: d.created_at,
            updated_at: d.updated_at,
            reported: Boolean(d.reported),
            raw: d,
          }))
        );
      }
      setDecksLoading(false);
    }
  }

  async function handleBlock(deckId: string) {
    setDecksLoading(true);
    try {
      const res = await blockDeckAction(deckId);
      if (!res.ok) setDecksError(res.error ?? "Failed to block");
    } finally {
      const status = getDeckStatusFromFilters();
      const r = await listDecksAction({ perPage: 50, page: 1, status });
      if (r.ok) {
        setDecksList(
          r.data.decks.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            creatorName: d.creator?.full_name ?? d.creator?.email ?? "Unknown",
            creatorEmail: d.creator?.email ?? "",
            flashcards_count: d.flashcards_count ?? 0,
            statusLabel: d.is_archived
              ? "Blocked"
              : d.is_public
              ? "Published"
              : "Under Review",
            is_public: Boolean(d.is_public),
            is_archived: Boolean(d.is_archived),
            study_count: d.study_count ?? 0,
            created_at: d.created_at,
            updated_at: d.updated_at,
            reported: Boolean(d.reported),
            raw: d,
          }))
        );
      }
      setDecksLoading(false);
    }
  }

  async function handleUnblock(deckId: string) {
    setDecksLoading(true);
    try {
      const res = await unblockDeckAction(deckId);
      if (!res.ok) setDecksError(res.error ?? "Failed to unblock");
    } finally {
      const status = getDeckStatusFromFilters();
      const r = await listDecksAction({ perPage: 50, page: 1, status });
      if (r.ok) {
        setDecksList(
          r.data.decks.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            creatorName: d.creator?.full_name ?? d.creator?.email ?? "Unknown",
            creatorEmail: d.creator?.email ?? "",
            flashcards_count: d.flashcards_count ?? 0,
            statusLabel: d.is_archived
              ? "Blocked"
              : d.is_public
              ? "Published"
              : "Under Review",
            is_public: Boolean(d.is_public),
            is_archived: Boolean(d.is_archived),
            study_count: d.study_count ?? 0,
            created_at: d.created_at,
            updated_at: d.updated_at,
            reported: Boolean(d.reported),
            raw: d,
          }))
        );
      }
      setDecksLoading(false);
    }
  }

  async function handleDeleteDeck(deckId: string) {
    setDecksLoading(true);
    try {
      const res = await deleteDeckAction(deckId);
      if (!res.ok) setDecksError(res.error ?? "Failed to delete");
    } finally {
      const status = getDeckStatusFromFilters();
      const r = await listDecksAction({ perPage: 50, page: 1, status });
      if (r.ok) {
        setDecksList(
          r.data.decks.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            creatorName: d.creator?.full_name ?? d.creator?.email ?? "Unknown",
            creatorEmail: d.creator?.email ?? "",
            flashcards_count: d.flashcards_count ?? 0,
            statusLabel: d.is_archived
              ? "Blocked"
              : d.is_public
              ? "Published"
              : "Under Review",
            is_public: Boolean(d.is_public),
            is_archived: Boolean(d.is_archived),
            study_count: d.study_count ?? 0,
            created_at: d.created_at,
            updated_at: d.updated_at,
            reported: Boolean(d.reported),
            raw: d,
          }))
        );
      }
      setDecksLoading(false);
    }
  }

  // rest of user-management action handlers unchanged (onViewProfile, edit, etc.)
  async function onViewProfile(id: string) {
    setProfileOpen(true);
    setProfileDetails(null);
    setSelectedId(id);
    try {
      const res = await getUserAction(id);
      if (res.ok) setProfileDetails(res.data);
      else setProfileDetails({ error: res.error });
    } catch {
      setProfileDetails({ error: "Failed to load profile" });
    }
  }

  function onOpenEdit(id: string) {
    const u = users.find((x) => x.id === id);
    setEditState({
      id,
      email: u?.email ?? "",
      full_name: u?.name ?? "",
      avatar_url: u?.avatar ?? "",
      status: u?.status ?? "Active",
    });
    setEditOpen(true);
  }

  async function saveEdit(e?: React.FormEvent) {
    e?.preventDefault?.();
    setSavingEdit(true);
    try {
      const { id, email, full_name, avatar_url, status } = editState;
      const res = await updateUserAction({
        id,
        email,
        full_name,
        avatar_url,
        status,
      });
      if (!res.ok) {
        setError(res.error ?? "Failed to save user");
      } else {
        await refreshList();
        setEditOpen(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to save user");
    } finally {
      setSavingEdit(false);
    }
  }

  function onOpenChangeRole(id: string, currentRole = "user") {
    setRoleState({ id, role: currentRole.toLowerCase() });
    setRoleOpen(true);
  }

  async function saveRoleChange(e?: React.FormEvent) {
    e?.preventDefault?.();
    setChangingRole(true);
    try {
      const res = await changeRoleAction({
        id: roleState.id,
        role: roleState.role,
      });
      if (!res.ok) setError(res.error ?? "Failed to change role");
      else {
        await refreshList();
        setRoleOpen(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to change role");
    } finally {
      setChangingRole(false);
    }
  }

  function onConfirm(action: "suspend" | "delete", id: string) {
    setConfirmAction({ type: action, id });
    setConfirmOpen(true);
  }

  async function executeConfirm() {
    if (!confirmAction) return;
    setConfirmLoading(true);
    try {
      const { type, id } = confirmAction;
      if (type === "suspend") {
        const res = await suspendUserAction({ id });
        if (!res.ok) setError(res.error ?? "Failed to suspend");
        else await refreshList();
      } else if (type === "delete") {
        const res = await deleteUserAction(id);
        if (!res.ok) setError(res.error ?? "Failed to delete");
        else await refreshList();
      }
      setConfirmOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Action failed");
    } finally {
      setConfirmLoading(false);
      setConfirmAction(null);
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Admin Dashboard"
        text="Manage users, content, and platform settings."
      >
        {/* Add user dialog (unchanged) */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form
              onSubmit={async (e) => {
                e?.preventDefault?.();
                setCreating(true);
                setCreateError(null);
                try {
                  const fullName =
                    (firstName || lastName) &&
                    `${firstName} ${lastName}`.trim();
                  const res = await createUserAction({
                    email: newEmail,
                    full_name: fullName ?? undefined,
                    role: newRole,
                  });
                  if (!res.ok) {
                    setCreateError(res.error ?? "Failed to create user");
                    return;
                  }
                  await refreshList();
                  setFirstName("");
                  setLastName("");
                  setNewEmail("");
                  setNewRole("user");
                  setAddOpen(false);
                } catch (err: any) {
                  setCreateError(err?.message ?? "Failed to create user");
                } finally {
                  setCreating(false);
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newRole}
                    onValueChange={(v) => setNewRole(v as "user" | "admin")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Permissions (informational)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-manage-users" />
                      <Label htmlFor="perm-manage-users">Manage Users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-moderate-content" defaultChecked />
                      <Label htmlFor="perm-moderate-content">
                        Moderate Content
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-view-analytics" defaultChecked />
                      <Label htmlFor="perm-view-analytics">
                        View Analytics
                      </Label>
                    </div>
                  </div>
                </div>
                {createError && (
                  <div className="text-destructive">{createError}</div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Profile dialog (unchanged) */}
        <Dialog
          open={profileOpen}
          onOpenChange={(open) => {
            if (!open) setProfileDetails(null);
            setProfileOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {!profileDetails && <div>Loading...</div>}
              {profileDetails?.error && (
                <div className="text-destructive">{profileDetails.error}</div>
              )}
              {profileDetails && !profileDetails.error && (
                <div>
                  <div>
                    <strong>ID:</strong> {profileDetails.id}
                  </div>
                  <div>
                    <strong>Email:</strong> {profileDetails.email}
                  </div>
                  <div>
                    <strong>Name:</strong>{" "}
                    {profileDetails.profile?.full_name ?? "-"}
                  </div>
                  <div>
                    <strong>Role:</strong> {profileDetails.profile?.role ?? "-"}
                  </div>
                  <div>
                    <strong>Last active:</strong>{" "}
                    {profileDetails.profile?.last_active_at
                      ? new Date(
                          profileDetails.profile.last_active_at
                        ).toLocaleString()
                      : profileDetails.last_sign_in_at
                      ? new Date(
                          profileDetails.last_sign_in_at
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setProfileOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <div className="px-6 pb-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="mb-0">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="content">Content Moderation</TabsTrigger>
          </TabsList>

          {/* User management tab (unchanged rendering) */}
          <TabsContent value="users" className="space-y-4">
            <Card className="shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="px-6 py-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">User Management</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      View and manage all users on the platform.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search users by name, email or id..."
                        className="pl-10 w-[320px]"
                      />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Filter className="h-4 w-4" />
                          Filters
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <div className="px-3 py-2">
                          <DropdownMenuLabel className="text-sm font-medium">
                            Filter by role
                          </DropdownMenuLabel>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2">
                              <Checkbox
                                id="filter-admin"
                                checked={roleFilters.admin}
                                onCheckedChange={(v) =>
                                  setRoleFilters((p) => ({
                                    ...p,
                                    admin: Boolean(v),
                                  }))
                                }
                              />
                              <span className="text-sm">Admin</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <Checkbox
                                id="filter-user"
                                checked={roleFilters.user}
                                onCheckedChange={(v) =>
                                  setRoleFilters((p) => ({
                                    ...p,
                                    user: Boolean(v),
                                  }))
                                }
                              />
                              <span className="text-sm">User</span>
                            </label>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRoleFilters({ admin: false, user: false });
                                setStatusFilters({
                                  active: false,
                                  inactive: false,
                                  suspended: false,
                                });
                              }}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {loading && (
                  <div className="p-4 text-sm text-muted-foreground">
                    Loading users...
                  </div>
                )}
                {error && (
                  <div className="p-4 text-sm text-red-600">{error}</div>
                )}

                <div className="rounded-lg overflow-hidden border border-gray-100 shadow">
                  <Table className="min-w-full bg-white">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Decks</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-1 ring-gray-100">
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback className="text-sm">
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                                {user.rawFull && (
                                  <span className="text-xs text-muted-foreground">
                                    {user.rawFull}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                user.role === "Admin" ? "default" : "outline"
                              }
                              className="px-2 py-1"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-sm">
                            {user.lastActive}
                          </TableCell>
                          <TableCell className="text-sm">
                            {user.decks}
                          </TableCell>
                          <TableCell className="text-sm">
                            {user.joined}
                          </TableCell>

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                <DropdownMenuItem
                                  onClick={() => onViewProfile(user.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => onOpenEdit(user.id)}
                                  className="flex items-center gap-2"
                                >
                                  <PenLine className="h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() =>
                                    onOpenChangeRole(user.id, user.role)
                                  }
                                  className="flex items-center gap-2"
                                >
                                  <Shield className="h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>

                                {user.lastActive !== "-" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onConfirm("suspend", user.id)
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <Lock className="h-4 w-4" />
                                    Suspend User
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="text-destructive flex items-center gap-2"
                                  onClick={() => onConfirm("delete", user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button variant="ghost" size="sm" className="px-4">
                    Previous
                  </Button>
                  <Button variant="ghost" size="sm" className="px-4">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content moderation tab (connected to deck-moderation.action.ts) */}
          <TabsContent value="content" className="space-y-4">
            <Card className="shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="px-6 py-4 bg-white">
                <CardTitle className="text-xl">Content Moderation</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Review and moderate user-created content.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search decks..."
                        className="pl-10 w-[320px]"
                        value={deckQuery}
                        onChange={(e) => setDeckQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {decksLoading && (
                  <div className="p-4 text-sm text-muted-foreground">
                    Loading decks...
                  </div>
                )}
                {decksError && (
                  <div className="p-4 text-sm text-red-600">{decksError}</div>
                )}

                <div className="rounded-lg overflow-hidden border border-gray-100 shadow">
                  <Table className="min-w-full bg-white">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Deck Name</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Cards</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {decksList.map((deck) => (
                        <TableRow
                          key={deck.id}
                          className={`hover:bg-gray-50 ${
                            deck.reported ? "bg-red-50" : ""
                          }`}
                        >
                          <TableCell>
                            <div className="font-medium">
                              {deck.name}
                              {deck.reported && (
                                <Badge variant="destructive" className="ml-2">
                                  Reported
                                </Badge>
                              )}
                            </div>
                            {deck.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {deck.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {deck.creatorName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {deck.creatorEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{deck.flashcards_count}</TableCell>
                          <TableCell>{deck.study_count ?? "-"}</TableCell>
                          <TableCell>
                            {deck.created_at
                              ? new Date(deck.created_at).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {deck.updated_at
                              ? new Date(deck.updated_at).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteDeck(deck.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Deck
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button variant="ghost" size="sm">
                    Previous
                  </Button>
                  <Button variant="ghost" size="sm">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
