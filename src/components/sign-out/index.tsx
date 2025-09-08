"use client";

import Link from "next/link";
import { signOut } from "./action";

export function SignOut() {
  return (
    <nav className="flex items-center gap-4">
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
        className="text-sm font-medium hover:text-primary"
      >
        Logout
      </Link>
    </nav>
  );
}
