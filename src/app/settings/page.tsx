"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun } from "lucide-react";
import {
  setDefaultReviewTabAction,
  setThemeAction,
  setCardStyleAction,
  getAccountNamesAction,
  updateAccountNamesAction,
} from "./page.action";
import { useEffect, useState, useTransition } from "react";

export default function Page() {
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountEmail, setAccountEmail] = useState<string | null>(
    ""
  );

  useEffect(() => {
    startTransition(async () => {
      const { firstName, lastName, email } = await getAccountNamesAction();
      console.log(firstName, lastName, email);
      if (firstName) setFirstName(firstName);
      if (lastName) setLastName(lastName);
      if (email !== undefined) setAccountEmail(email);
    });
  }, []);

  // --- cookie helpers (client-side, mirrors your review tab example) ---
  const getCookie = (name: string) =>
    typeof document === "undefined"
      ? undefined
      : document.cookie
          .split("; ")
          .find((v) => v.startsWith(name + "="))
          ?.split("=")?.[1];

  const defaultReviewTab = getCookie("default_review_tab") ?? "cards";

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

                  <RadioGroup
                    defaultValue={defaultReviewTab}
                    onValueChange={(v) => {
                      startTransition(async () => {
                        await setDefaultReviewTabAction(v);
                      });
                    }}
                  >
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Appearance (wired to cookie-backed actions) ---------------- */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your Deckora experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AppearanceSection />
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
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />{" "}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />{" "}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    disabled
                    defaultValue={accountEmail ?? ""}
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
              <Button
                className="w-full"
                onClick={() =>
                  startTransition(async () => {
                    const res = await updateAccountNamesAction(
                      firstName,
                      lastName
                    );
                    console.log(res.message);
                  })
                }
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}

function AppearanceSection() {
  const [, startTransition] = useTransition();

  // read cookies once on mount
  const getCookie = (name: string) =>
    typeof document === "undefined"
      ? undefined
      : document.cookie
          .split("; ")
          .find((v) => v.startsWith(name + "="))
          ?.split("=")?.[1];

  const [theme, setTheme] = useState(getCookie("theme") ?? "system");
  const [cardStyle, setCardStyle] = useState(
    getCookie("card_style") ?? "standard"
  );

  // optional: sync when cookie changes externally
  useEffect(() => {
    setTheme(getCookie("theme") ?? "system");
  }, []);

  const handleTheme = (value: "light" | "dark" | "system") => {
    setTheme(value);
    startTransition(async () => {
      await setThemeAction(value);
    });
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          {/* Light */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10 transition"
              onClick={() => handleTheme("light")}
            >
              <Sun className="h-5 w-5" />
              <span className="sr-only">Light</span>
            </Button>
            <span className="text-xs">Light</span>
          </div>

          {/* Dark */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10 transition"
              onClick={() => handleTheme("dark")}
            >
              <Moon className="h-5 w-5" />
              <span className="sr-only">Dark</span>
            </Button>
            <span className="text-xs">Dark</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Card Appearance</Label>
        <RadioGroup
          defaultValue={cardStyle}
          onValueChange={(v) =>
            startTransition(async () => {
              setCardStyle(v);
              await setCardStyleAction(
                v as "standard" | "rounded" | "elevated"
              );
            })
          }
        >
          <div className="grid grid-cols-3 gap-4">
            {["standard", "rounded"].map((style) => (
              <div key={style} className="flex flex-col items-center space-y-2">
                <div
                  className={`flex aspect-[3/2] w-full items-center justify-center rounded-lg border p-2 ${
                    cardStyle === style
                      ? "ring-2 ring-primary border-primary"
                      : ""
                  } ${style === "standard" ? "!rounded-none" : ""} ${
                    style === "elevated" ? "!shadow-2xs" : ""
                  }`}
                >
                  <div className="flex h-full w-full items-center justify-center bg-muted rounded-sm">
                    <span className="text-xs capitalize">{style}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={style} id={`card-${style}`} />
                  <Label htmlFor={`card-${style}`} className="capitalize">
                    {style}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
