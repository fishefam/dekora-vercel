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
import { forgotPassword } from "./action";

const formSchema = z.object({
  email: z.email({ message: "Invalid email" }),
});

export type Creds = z.infer<typeof formSchema>;

export default function Page() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string>();
  const [sent, setSent] = useState(false);

  const form = useForm<Creds>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: Creds) {
    setSendError(undefined);
    setSent(false);
    setIsSending(true);

    forgotPassword(values)
      .then(() => {
        setSent(true);
      })
      .catch((err) => {
        setSendError(err?.message ?? "Something went wrong");
      })
      .finally(() => {
        setIsSending(false);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="mx-auto sm:w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Reset your password
            </CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {sendError?.length && (
              <p className="text-destructive text-sm text-left">{sendError}</p>
            )}

            {sent && (
              <p className="text-sm text-left text-muted-foreground">
                If an account exists for that email, we&apos;ve sent a password
                reset link.
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit">
              {isSending && (
                <div className="size-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              Send reset link
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
