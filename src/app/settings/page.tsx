import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Laptop, Moon, Sun } from "lucide-react";

export default function Page() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage your account settings and preferences."
      ></DashboardHeader>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>
                Customize how you study and review flashcards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Review Tab</Label>
                  <RadioGroup defaultValue="cards">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cards" id="mode-cards" />
                      <Label htmlFor="mode-cards">Flashcards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quiz" id="mode-quiz" />
                      <Label htmlFor="mode-quiz">Quiz Mode</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Study Behavior</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-flip" />
                        <Label htmlFor="auto-flip">
                          Auto-flip cards after 10 seconds
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="audio-feedback" defaultChecked />
                        <Label htmlFor="audio-feedback">
                          Play sound on correct/incorrect answers
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your Deckora experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <Sun className="h-5 w-5" />
                        <span className="sr-only">Light</span>
                      </Button>
                      <span className="text-xs">Light</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <Moon className="h-5 w-5" />
                        <span className="sr-only">Dark</span>
                      </Button>
                      <span className="text-xs">Dark</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <Laptop className="h-5 w-5" />
                        <span className="sr-only">System</span>
                      </Button>
                      <span className="text-xs">System</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Card Appearance</Label>
                  <RadioGroup defaultValue="standard">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-md border p-2">
                          <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted">
                            <span className="text-xs">Standard</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="card-standard" />
                          <Label htmlFor="card-standard">Standard</Label>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-md border p-2">
                          <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
                            <span className="text-xs">Rounded</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rounded" id="card-rounded" />
                          <Label htmlFor="card-rounded">Rounded</Label>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-md border p-2">
                          <div className="flex h-full w-full items-center justify-center bg-muted shadow-md">
                            <span className="text-xs">Elevated</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="elevated" id="card-elevated" />
                          <Label htmlFor="card-elevated">Elevated</Label>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">A</span>
                    <Slider
                      defaultValue={[16]}
                      max={24}
                      min={12}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-lg">A</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and manage your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    disabled
                    defaultValue="john.doe@example.com"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
