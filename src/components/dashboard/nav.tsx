"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  BookOpen,
  BookOpenCheck,
  BarChart3,
  Settings,
  Download,
  Upload,
  ShieldUser,
} from "@/components/icons";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Decks",
    href: "/",
    icon: BookOpen,
  },
  {
    title: "Review",
    href: "/review",
    icon: BookOpenCheck,
  },
  {
    title: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    title: "Import",
    href: "/import",
    icon: Upload,
  },
  {
    title: "Export",
    href: "/export",
    icon: Download,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Administrator",
    href: "/admin",
    icon: ShieldUser,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 px-2 py-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.disabled ? "#" : item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start",
            item.disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
