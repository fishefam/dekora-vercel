"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "./action";
import { useState } from "react";

export type Creds = z.infer<typeof formSchema>;

const formSchema = z.object({
  remember: z.boolean(),
  email: z.email({ error: "Invalid email" }),
  password: z.string(),
});

export default function LoginPage() {
  const [isLoggingIn, setIsLogginIn] = useState(false);
  const [loginError, setLoginError] = useState<string>();
  const form = useForm<Creds>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(values: Creds) {
    setLoginError(undefined);
    setIsLogginIn(true);
    login(values).catch((err) => {
      setLoginError(err.message);
      setIsLogginIn(false);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="mx-auto sm:w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Sign in to Deckora
            </CardTitle>
            <CardDescription>
              Enter your email and password to access your flashcards
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={field.disabled}
                      name={field.name}
                      onBlur={field.onBlur}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormLabel>Remember me</FormLabel>
                </FormItem>
              )}
            />

            {loginError?.length && (
              <p className="text-destructive text-sm text-left">{loginError}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit">
              {isLoggingIn && (
                <div className="size-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              Sign In
            </Button>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
