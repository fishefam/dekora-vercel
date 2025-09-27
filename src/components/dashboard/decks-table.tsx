"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { getDecksAction } from "./decks-table.action";

// Match your server action row
type DeckRow = {
  id: string;
  name: string;
  cards: number;
  created_at: string; // ISO
  last_studied_at: string | null;
  updated_at: string | null;
};

interface DeckVM {
  id: string;
  name: string;
  cards: number;
  lastStudied: string; // humanized or "—"
  created: string; // formatted date
}

interface DecksTableProps {
  filter?: "all" | "recent";
}

export function DecksTable({ filter = "all" }: DecksTableProps) {
  const [rows, setRows] = useState<DeckRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const r = await getDecksAction();
        if (!ac.signal.aborted) setRows(r);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!ac.signal.aborted)
          setErrorMsg(e?.message ?? "Failed to load decks");
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    };
    run();
    return () => ac.abort();
  }, []);

  const allDecks: DeckVM[] = useMemo(
    () =>
      rows.map((v) => ({
        id: v.id,
        name: v.name,
        cards: v.cards,
        lastStudied: v.last_studied_at ? relTime(v.last_studied_at) : "—",
        created: fmtDate(v.created_at),
      })),
    [rows]
  );

  const decks = useMemo(() => {
    if (filter === "recent") {
      // recent = most recently studied (fallback to updated/created handled by server order)
      return allDecks.slice(0, 5);
    }
    return allDecks;
  }, [allDecks, filter]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Name</TableHead>
          <TableHead>Cards</TableHead>
          <TableHead>Last Studied</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell>
                <div className="h-4 w-44 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-10 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-4 ml-auto w-8 animate-pulse rounded bg-muted" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && errorMsg && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-sm text-destructive"
            >
              {errorMsg}
            </TableCell>
          </TableRow>
        )}

        {!isLoading && !errorMsg && decks.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-sm text-muted-foreground"
            >
              No decks found.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          !errorMsg &&
          decks.map((deck) => (
            <TableRow key={deck.id}>
              <TableCell className="font-medium">{deck.name}</TableCell>
              <TableCell>{deck.cards}</TableCell>
              <TableCell>{deck.lastStudied}</TableCell>
              <TableCell>{deck.created}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Study Now</DropdownMenuItem>
                    <DropdownMenuItem>Edit Deck</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Share Deck</DropdownMenuItem>
                    <DropdownMenuItem>Export Deck</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete Deck
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

/* utils */
function relTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  if (s < 60) return `${s}s ago`;
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (day < 7) return `${day}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));
}
