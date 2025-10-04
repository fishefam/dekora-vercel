/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/icons";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  getUsersAction,
  createUserAction,
  updateUserRoleAction,
  updateUserStatusAction,
  deleteUserAction,
  type AdminUser,
} from "./action";

export default function Page() {
  // table data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // search & filters
  const [q, setQ] = useState("");
  const [qLive, setQLive] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    Set<"Admin" | "Curator" | "User">
  >(new Set());
  const [statusFilter, setStatusFilter] = useState<
    Set<"Active" | "Inactive" | "Suspended">
  >(new Set());

  const [loading, setLoading] = useState(true);

  // add user dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<"user" | "curator" | "admin">("user");
  const [creating, setCreating] = useState(false);

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => setQ(qLive), 350);
    return () => clearTimeout(t);
  }, [qLive]);

  // fetch users
  const reload = async (newPage = page) => {
    setLoading(true);
    const roles = Array.from(roleFilter);
    const statuses = Array.from(statusFilter);
    const res = await getUsersAction({
      q,
      roles,
      statuses,
      page: newPage,
      pageSize,
    });
    setUsers(res.rows);
    setTotal(res.total);
    setPage(res.page ?? newPage);
    setLoading(false);
  };

  useEffect(() => {
    reload(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, roleFilter, statusFilter]);

  // filter handlers
  const toggleRole = (r: "Admin" | "Curator" | "User") =>
    setRoleFilter((s) => {
      const n = new Set(s);
      n.has(r) ? n.delete(r) : n.add(r);
      return n;
    });

  const toggleStatus = (s0: "Active" | "Inactive" | "Suspended") =>
    setStatusFilter((s) => {
      const n = new Set(s);
      n.has(s0) ? n.delete(s0) : n.add(s0);
      return n;
    });

  // actions
  const onCreateUser = async () => {
    setCreating(true);
    const ok = await createUserAction({
      firstName,
      lastName,
      email,
      role: newRole,
    });
    setCreating(false);
    if (ok.ok) {
      setOpenAdd(false);
      setFirst("");
      setLast("");
      setEmail("");
      setNewRole("user");
      reload(1);
    }
  };

  const onChangeRole = async (
    u: AdminUser,
    roleUi: "Admin" | "Curator" | "User"
  ) => {
    const roleDb =
      roleUi === "Admin" ? "admin" : roleUi === "Curator" ? "curator" : "user";
    await updateUserRoleAction(u.id, roleDb);
    reload();
  };

  const onToggleActive = async (u: AdminUser) => {
    const next = u.status === "Active" ? "suspended" : "active";
    await updateUserStatusAction(u.id, next as "active" | "suspended");
    reload();
  };

  const onDelete = async (u: AdminUser) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    await deleteUserAction(u.id);
    reload();
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total]
  );

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Manage users">
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirst(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLast(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newRole}
                  onValueChange={(v) => setNewRole(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="curator">Curator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Permissions UI placeholder – wire as needed */}
            </div>
            <DialogFooter>
              <Button type="button" onClick={onCreateUser} disabled={creating}>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="w-[250px] pl-8"
                  value={qLive}
                  onChange={(e) => setQLive(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(["Admin", "Curator", "User"] as const).map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-${r.toLowerCase()}`}
                          checked={roleFilter.has(r)}
                          onCheckedChange={() => toggleRole(r)}
                        />
                        <Label htmlFor={`filter-${r.toLowerCase()}`}>{r}</Label>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(["Active", "Inactive", "Suspended"] as const).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-${s.toLowerCase()}`}
                          checked={statusFilter.has(s)}
                          onCheckedChange={() => toggleStatus(s)}
                        />
                        <Label htmlFor={`filter-${s.toLowerCase()}`}>{s}</Label>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Decks</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar ?? undefined}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            user.role === "Admin"
                              ? "default"
                              : user.role === "Curator"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              user.status === "Active"
                                ? "bg-green-500"
                                : user.status === "Inactive"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span>{user.status}</span>
                        </div>
                      </TableCell>

                      <TableCell>{user.lastActive ?? "—"}</TableCell>
                      <TableCell>{user.decks}</TableCell>
                      <TableCell>{user.joined}</TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onChangeRole(
                                  user,
                                  user.role === "Admin" ? "User" : "Admin"
                                )
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {user.role === "Admin"
                                ? "Make User"
                                : "Make Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onChangeRole(user, "Curator")}
                            >
                              <PenLine className="mr-2 h-4 w-4" />
                              Make Curator
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "Active" ? (
                              <DropdownMenuItem
                                onClick={() => onToggleActive(user)}
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => onToggleActive(user)}
                              >
                                <Unlock className="mr-2 h-4 w-4" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDelete(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const p = Math.max(1, page - 1);
                setPage(p);
                reload(p);
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                const p = Math.min(totalPages, page + 1);
                setPage(p);
                reload(p);
              }}
            >
              Next
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
