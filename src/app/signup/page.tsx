"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Credentials, signupAction } from "./action";

export default function SignupPage() {
  const [state, setState] = useState<Credentials>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create a Deckora account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First name</Label>
            <Input
              id="first-name"
              placeholder="Truong"
              required
              value={state.firstName}
              onChange={(e) =>
                setState({ ...state, firstName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input
              id="last-name"
              placeholder="Nguyen"
              required
              value={state.lastName}
              onChange={(e) => setState({ ...state, lastName: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            value={state.email}
            id="email"
            type="email"
            placeholder="trg.mnguyen@gmail.com"
            onChange={(e) => setState({ ...state, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={state.password}
            required
            onChange={(e) => setState({ ...state, password: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters long and include a number and
            a special character
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            value={state.confirmPassword}
            type="password"
            onChange={(e) =>
              setState({ ...state, confirmPassword: e.target.value })
            }
            required
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full" onClick={() => signupAction(state)}>
          Create Account
        </Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
