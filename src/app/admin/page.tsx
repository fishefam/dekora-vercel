import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
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
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Lock,
  MoreHorizontal,
  PenLine,
  Search,
  Shield,
  Trash2,
  Unlock,
  Users,
  UserPlus,
  BookOpen,
  Brain,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { users, decks, reports } from "./mocks";

export default function AdminDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Admin Dashboard"
        text="Manage users, content, and platform settings."
      >
        <Dialog>
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
                  <Input id="first-name" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="user">
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
              <div className="space-y-2">
                <Label>Permissions</Label>
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
                    <Label htmlFor="perm-view-analytics">View Analytics</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">195</div>
            <p className="text-xs text-muted-foreground">+15 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80</div>
            <p className="text-xs text-muted-foreground">+8 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Study Sessions
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">650</div>
            <p className="text-xs text-muted-foreground">+70 from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content">Content Moderation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all users on the platform.
              </CardDescription>
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
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-admin" />
                          <Label htmlFor="filter-admin">Admin</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-curator" />
                          <Label htmlFor="filter-curator">Curator</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-user" />
                          <Label htmlFor="filter-user">User</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-active" />
                          <Label htmlFor="filter-active">Active</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-inactive" />
                          <Label htmlFor="filter-inactive">Inactive</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-suspended" />
                          <Label htmlFor="filter-suspended">Suspended</Label>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
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
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
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
                            ></div>
                            <span>{user.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.lastActive}</TableCell>
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
                              <DropdownMenuItem>
                                <PenLine className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              {user.status === "Active" ? (
                                <DropdownMenuItem>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
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
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {" "}
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                Review and moderate user-created content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search decks..."
                      className="w-[250px] pl-8"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-published" />
                          <Label htmlFor="filter-published">Published</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-review" />
                          <Label htmlFor="filter-review">Under Review</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-blocked" />
                          <Label htmlFor="filter-blocked">Blocked</Label>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="filter-reported" />
                          <Label htmlFor="filter-reported">Reported</Label>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deck Name</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Cards</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decks.map((deck) => (
                      <TableRow
                        key={deck.id}
                        className={deck.reported ? "bg-red-50" : ""}
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
                        </TableCell>
                        <TableCell>{deck.creator}</TableCell>
                        <TableCell>{deck.cards}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              deck.status === "Published"
                                ? "default"
                                : deck.status === "Under Review"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {deck.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{deck.views}</TableCell>
                        <TableCell>{deck.created}</TableCell>
                        <TableCell>{deck.lastUpdated}</TableCell>
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
                                View Deck
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PenLine className="mr-2 h-4 w-4" />
                                Edit Deck
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {deck.status === "Published" ? (
                                <DropdownMenuItem>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Set to Review
                                </DropdownMenuItem>
                              ) : deck.status === "Under Review" ? (
                                <>
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Block
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Unblock
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
              <CardDescription>
                Review and handle user-submitted reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Attention Required</AlertTitle>
                  <AlertDescription>
                    There are 2 pending reports that require your review.
                  </AlertDescription>
                </Alert>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Reported Item</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Badge variant="outline">{report.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {report.item}
                          </TableCell>
                          <TableCell>{report.reporter}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === "Pending"
                                  ? "destructive"
                                  : report.status === "Under Review"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.date}</TableCell>
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
                                  View Details
                                </DropdownMenuItem>
                                {report.status !== "Resolved" && (
                                  <>
                                    <DropdownMenuItem>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Mark as Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Lock className="mr-2 h-4 w-4" />
                                      Block Content
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Dismiss Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
