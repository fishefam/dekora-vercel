/* eslint-disable @typescript-eslint/no-explicit-any */
// components/decks/DecksTable.tsx
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
import { useEffect, useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getDecksAction,
  type DeckRow as DeckRowServer,
} from "./decks-table.action";
import { createDeckAction } from "./decks-table.action";

type DeckVM = {
  id: string;
  name: string;
  cards: number;
  lastStudied: string; // humanized or "—"
  created: string; // formatted date
};

interface DecksTableProps {
  filter?: "all" | "recent";
}

export function DecksTable({ filter = "all" }: DecksTableProps) {
  const [rows, setRows] = useState<DeckRowServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // initial load
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const r = await getDecksAction();
        if (!ac.signal.aborted) setRows(r);
      } catch (e: any) {
        if (!ac.signal.aborted)
          setLoadError(e?.message ?? "Failed to load decks");
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    })();
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
    if (filter === "recent") return allDecks.slice(0, 5);
    return allDecks;
  }, [allDecks, filter]);

  // create deck
  const onCreate = () => {
    setCreateError(null);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setCreateError("Please enter at least 2 characters.");
      return;
    }
    startTransition(async () => {
      try {
        const created = await createDeckAction({ name: trimmed });
        // optimistic prepend to rows (server shape)
        setRows((prev) => [
          {
            id: created.id,
            name: created.name,
            cards: 0,
            created_at: created.created_at,
            last_studied_at: created.last_studied_at,
            updated_at: created.updated_at,
          },
          ...prev,
        ]);
        setName("");
        setDialogOpen(false);
      } catch (e: any) {
        setCreateError(e?.message ?? "Failed to create deck.");
      }
    });
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between mx-5">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Deck</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a new deck</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="deck-name">Name</Label>
              <Input
                id="deck-name"
                placeholder="e.g., Biology 101"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCreate()}
                disabled={isPending}
                autoFocus
              />
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={onCreate}
                disabled={isPending || name.trim().length < 2}
              >
                {isPending ? "Creating…" : "Create Deck"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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

          {!isLoading && loadError && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-destructive"
              >
                {loadError}
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !loadError && decks.length === 0 && (
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
            !loadError &&
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
    </>
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
