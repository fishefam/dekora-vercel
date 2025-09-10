import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { SignOut } from "@/components/sign-out";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import * as z from "zod";

const authSchema = z.object({ uid: z.uuid() });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = { title: "Deckora" };

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("auth")?.value;
  let payload: z.infer<typeof authSchema> = { uid: "" };
  try {
    const result = await jwtVerify<{ uid: string }>(
      jwt ?? "",
      new TextEncoder().encode(process.env.JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    payload = result.payload;
  } catch {}
  const parsed = authSchema.safeParse(payload);
  const isLoggedin = parsed.success;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative flex h-screen flex-col md:px-0 [&>*]:px-3 justify-between`}
      >
        <header className="top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Deckora</span>
            </Link>
            {isLoggedin && <SignOut />}
          </div>
        </header>

        {!isLoggedin && children}

        {isLoggedin && (
          <div className="container mx-auto flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
            <aside className="fixed top-14 z-30 -ml-2 hidden h-full w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
              {/* <DashboardNav /> */}
              Navbar here
            </aside>

            <main className="flex flex-col overflow-hidden py-6">
              {children}
            </main>
          </div>
        )}

        <footer className="w-full border-t bg-background">
          <div className="container mx-auto flex flex-col items-center justify-end gap-4 py-6 md:h-16 md:flex-row md:py-0">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Deckora. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
