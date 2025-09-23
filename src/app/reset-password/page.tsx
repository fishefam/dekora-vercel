// reset-password/page.tsx

"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { resetPassword } from "./action";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type Creds = z.infer<typeof formSchema>;

export default function Page() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string>();
  const [updated, setUpdated] = useState(false);

  const form = useForm<Creds>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: Creds) {
    const uid = new URL(location.href).searchParams.get("uid");

    if (!uid?.length) {
      setResetError(
        "Missing user id. Please verify and use the link from our email."
      );
      return;
    }

    setResetError(undefined);
    setUpdated(false);
    setIsResetting(true);

    resetPassword({
      ...values,
      uid,
    })
      .then(() => {
        setUpdated(true);
      })
      .catch((err) => {
        setResetError(err?.message ?? "Failed to reset password");
      })
      .finally(() => {
        setIsResetting(false);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="mx-auto sm:w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Set a new password
            </CardTitle>
            <CardDescription>
              Enter and confirm your new password to finish resetting your
              account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long and include a
                    number and a special character
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {resetError?.length && (
              <p className="text-destructive text-sm text-left">{resetError}</p>
            )}

            {updated && (
              <p className="text-sm text-left text-muted-foreground">
                Your password has been updated. You can now sign in.
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit">
              {isResetting && (
                <div className="size-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              Reset password
            </Button>

            <div className="text-center text-sm">
              Remembered your password?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
