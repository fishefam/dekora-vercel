// components/decks/decks-table.tsx
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getDecksAction,
  createDeckAction,
  updateDeckAction,
  type DeckRow as DeckRowServer,
} from "./decks-table.action";
import {
  deleteDeckAction,
  createFlashcardAction,
  getDeckFlashcardsAction,
  updateFlashcardAction,
  deleteFlashcardAction,
  type FlashcardRow,
} from "./decks-table.action";
import { CalendarDays, Clock, NotebookText } from "lucide-react";

type DeckVM = {
  id: string;
  name: string;
  cards: number;
  lastStudied: string;
  created: string;
};

interface DecksTableProps {
  filter?: "all" | "recent";
}

export function DecksTable({ filter = "all" }: DecksTableProps) {
  const [rows, setRows] = useState<DeckRowServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- create deck dialog state ---
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // --- edit deck dialog state ---
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditPending, startEditTransition] = useTransition();

  // --- delete deck alert state ---
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  // --- add flashcard dialog state ---
  const [addOpen, setAddOpen] = useState(false);
  const [addDeckId, setAddDeckId] = useState<string | null>(null);
  const [addDeckName, setAddDeckName] = useState<string>("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] = useState<string>("1");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAddPending, startAddTransition] = useTransition();

  // --- view flashcards modal state ---
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDeckId, setViewDeckId] = useState<string | null>(null);
  const [viewDeckName, setViewDeckName] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardRow[]>([]);

  // --- edit single flashcard dialog state ---
  const [fcEditOpen, setFcEditOpen] = useState(false);
  const [fcEdit, setFcEdit] = useState<FlashcardRow | null>(null);
  const [fcFront, setFcFront] = useState("");
  const [fcBack, setFcBack] = useState("");
  const [fcDiff, setFcDiff] = useState<string>("");
  const [isFcSavePending, startFcSave] = useTransition();

  // --- delete flashcard dialog state ---
  const [fcDeleteOpen, setFcDeleteOpen] = useState(false);
  const [fcDelete, setFcDelete] = useState<FlashcardRow | null>(null);
  const [isFcDeletePending, startFcDelete] = useTransition();

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
        setCreateOpen(false);
      } catch (e: any) {
        setCreateError(e?.message ?? "Failed to create deck.");
      }
    });
  };

  // edit deck
  const openEdit = (deckId: string) => {
    const current = rows.find((r) => r.id === deckId);
    if (!current) return;
    setEditId(deckId);
    setEditName(current.name);
    setEditError(null);
    setEditOpen(true);
  };

  const onSaveEdit = () => {
    setEditError(null);
    const newName = editName.trim();
    if (newName.length < 2) {
      setEditError("Please enter at least 2 characters.");
      return;
    }
    if (!editId) return;

    const prev = rows;
    setRows(prev.map((r) => (r.id === editId ? { ...r, name: newName } : r)));

    startEditTransition(async () => {
      try {
        const updated = await updateDeckAction({ id: editId, name: newName });
        setRows((cur) =>
          cur.map((r) =>
            r.id === editId
              ? {
                  ...r,
                  name: updated.name,
                  created_at: updated.created_at,
                  last_studied_at: updated.last_studied_at,
                  updated_at: updated.updated_at,
                }
              : r
          )
        );
        setEditOpen(false);
      } catch (e: any) {
        setRows(prev); // revert
        setEditError(e?.message ?? "Failed to update deck.");
      }
    });
  };

  // delete deck
  const openDelete = (deckId: string) => {
    const current = rows.find((r) => r.id === deckId);
    if (!current) return;
    setDeleteId(deckId);
    setDeleteName(current.name);
    setDeleteError(null);
    setDeleteOpen(true);
  };

  const onConfirmDelete = () => {
    if (!deleteId) return;
    const prev = rows;
    setRows(prev.filter((r) => r.id !== deleteId));

    startDeleteTransition(async () => {
      try {
        await deleteDeckAction({ id: deleteId! });
        setDeleteOpen(false);
      } catch (e: any) {
        setRows(prev); // revert on failure
        setDeleteError(e?.message ?? "Failed to delete deck.");
      }
    });
  };

  // add flashcard
  const openAddFlashcard = (deckId: string) => {
    const d = rows.find((r) => r.id === deckId);
    if (!d) return;
    setAddDeckId(deckId);
    setAddDeckName(d.name);
    setFront("");
    setBack("");
    setDifficulty("1");
    setAddError(null);
    setAddOpen(true);
  };

  const onConfirmAddFlashcard = () => {
    setAddError(null);
    if (!addDeckId) return;
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) {
      setAddError("Front and Back are required.");
      return;
    }

    startAddTransition(async () => {
      try {
        await createFlashcardAction({
          deckId: addDeckId,
          front: f,
          back: b,
          difficulty, // varchar '1'..'5'
        });
        // Optimistic: bump card count on that deck row
        setRows((prev) =>
          prev.map((r) =>
            r.id === addDeckId ? { ...r, cards: (r.cards || 0) + 1 } : r
          )
        );
        setAddOpen(false);
      } catch (e: any) {
        setAddError(e?.message ?? "Failed to add flashcard.");
      }
    });
  };

  // view flashcards (table in modal)
  const fetchFlashcards = async (deckId: string) => {
    setViewLoading(true);
    setViewError(null);
    try {
      const rows = await getDeckFlashcardsAction({ deckId });
      setFlashcards(rows);
    } catch (e: any) {
      setViewError(e?.message ?? "Failed to load flashcards.");
    } finally {
      setViewLoading(false);
    }
  };

  const openViewFlashcards = (deckId: string) => {
    const d = rows.find((r) => r.id === deckId);
    if (!d) return;
    setViewDeckId(deckId);
    setViewDeckName(d.name);
    setViewOpen(true);
    fetchFlashcards(deckId);
  };

  const openEditFlashcard = (row: FlashcardRow) => {
    setFcEdit(row);
    setFcFront(row.front);
    setFcBack(row.back);
    setFcDiff(row.difficulty ?? "");
    setFcEditOpen(true);
  };

  const onSaveFlashcard = () => {
    if (!fcEdit || !viewDeckId) return;
    const front = fcFront.trim();
    const back = fcBack.trim();
    if (!front || !back) return;

    startFcSave(async () => {
      try {
        const updated = await updateFlashcardAction({
          id: fcEdit.id,
          deckId: viewDeckId,
          front,
          back,
          difficulty: fcDiff || null,
        });
        setFlashcards((prev) =>
          prev.map((f) => (f.id === updated.id ? updated : f))
        );
        setFcEditOpen(false);
      } catch {
        // no-op; you can add toast/error here
      }
    });
  };

  const openDeleteFlashcard = (row: FlashcardRow) => {
    setFcDelete(row);
    setFcDeleteOpen(true);
  };

  const onConfirmDeleteFlashcard = () => {
    if (!fcDelete || !viewDeckId) return;
    startFcDelete(async () => {
      try {
        await deleteFlashcardAction({ id: fcDelete.id, deckId: viewDeckId });
        setFlashcards((prev) => prev.filter((f) => f.id !== fcDelete.id));
        // Also decrement the deck's card count in the main list
        setRows((prev) =>
          prev.map((r) =>
            r.id === viewDeckId ? { ...r, cards: Math.max(0, r.cards - 1) } : r
          )
        );
        setFcDeleteOpen(false);
      } catch {
        // no-op; you can add toast/error here
      }
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 mx-5">
        <div>
          <h2 className="text-lg font-semibold">Flashcard Decks</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your flashcard decks.
          </p>
        </div>

        {/* New Deck */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-8">New Deck</Button>
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
                onClick={() => setCreateOpen(false)}
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

      {/* Edit Deck Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-deck-name">Name</Label>
            <Input
              id="edit-deck-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSaveEdit()}
              disabled={isEditPending}
              autoFocus
            />
            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              disabled={isEditPending}
            >
              Cancel
            </Button>
            <Button
              onClick={onSaveEdit}
              disabled={isEditPending || editName.trim().length < 2}
            >
              {isEditPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Deck Alert */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteName}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              deck <span className="font-medium">“{deleteName}”</span>.
              {deleteError && (
                <span className="block pt-2 text-destructive">
                  {deleteError}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={isDeletePending}
            >
              {isDeletePending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Flashcard Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add Flashcard{addDeckName ? ` — ${addDeckName}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fc-front">Front</Label>
              <textarea
                id="fc-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                className="w-full rounded-md border bg-background p-2 text-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Question / prompt"
                disabled={isAddPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fc-back">Back</Label>
              <textarea
                id="fc-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={4}
                className="w-full rounded-md border bg-background p-2 text-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Answer"
                disabled={isAddPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fc-difficulty">Difficulty</Label>
              <select
                id="fc-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isAddPending}
                className="w-40 rounded-md border bg-background p-2 text-sm"
              >
                <option value="1">1 (Easy)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 (Hard)</option>
              </select>
            </div>

            {addError && <p className="text-sm text-destructive">{addError}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setAddOpen(false)}
              disabled={isAddPending}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmAddFlashcard}
              disabled={isAddPending || !front.trim() || !back.trim()}
            >
              {isAddPending ? "Adding…" : "Add Flashcard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Flashcards Modal (scrollable, sticky header) */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="!max-w-[1000px] p-0">
          {/* Make the entire modal a column with a scrollable content area */}
          <div className="flex h-[80vh] flex-col">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>Flashcards — {viewDeckName}</DialogTitle>
            </DialogHeader>

            <div className="grow overflow-auto px-4 pb-4 pt-3">
              {viewLoading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : viewError ? (
                <div className="p-4 text-sm text-destructive">{viewError}</div>
              ) : flashcards.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No flashcards yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Front</TableHead>
                        <TableHead>Back</TableHead>
                        <TableHead className="w-28">Difficulty</TableHead>
                        <TableHead className="text-right w-40">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flashcards.map((f, i) => (
                        <TableRow key={f.id}>
                          <TableCell>{f.position ?? i + 1}</TableCell>
                          <TableCell className="max-w-[360px] whitespace-normal break-words">
                            <span title={f.front} className="line-clamp-2">
                              {f.front}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[360px] whitespace-normal break-words">
                            <span title={f.back} className="line-clamp-2">
                              {f.back}
                            </span>
                          </TableCell>
                          <TableCell>{f.difficulty ?? "—"}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditFlashcard(f)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteFlashcard(f)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Flashcard Dialog */}
      <Dialog open={fcEditOpen} onOpenChange={setFcEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-front">Front</Label>
              <textarea
                id="edit-front"
                value={fcFront}
                onChange={(e) => setFcFront(e.target.value)}
                rows={3}
                className="w-full rounded-md border bg-background p-2 text-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isFcSavePending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-back">Back</Label>
              <textarea
                id="edit-back"
                value={fcBack}
                onChange={(e) => setFcBack(e.target.value)}
                rows={4}
                className="w-full rounded-md border bg-background p-2 text-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isFcSavePending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-diff">Difficulty</Label>
              <select
                id="edit-diff"
                value={fcDiff}
                onChange={(e) => setFcDiff(e.target.value)}
                disabled={isFcSavePending}
                className="w-40 rounded-md border bg-background p-2 text-sm"
              >
                <option value="">—</option>
                <option value="1">1 (Easy)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 (Hard)</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setFcEditOpen(false)}
              disabled={isFcSavePending}
            >
              Cancel
            </Button>
            <Button
              onClick={onSaveFlashcard}
              disabled={isFcSavePending || !fcFront.trim() || !fcBack.trim()}
            >
              {isFcSavePending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Flashcard Confirm */}
      <AlertDialog open={fcDeleteOpen} onOpenChange={setFcDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove flashcard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected flashcard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isFcDeletePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDeleteFlashcard}
              disabled={isFcDeletePending}
            >
              {isFcDeletePending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* RESPONSIVE CONTENT */}
      {/* LIST for mobile (< md) */}
      <div className="md:hidden space-y-3 mx-5">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`sk-m-${i}`}
              className="rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}

        {!isLoading && loadError && (
          <div className="rounded-2xl border bg-card p-4 text-sm text-destructive">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && decks.length === 0 && (
          <div className="rounded-2xl border bg-card p-4 text-center text-sm text-muted-foreground">
            No decks found.
          </div>
        )}

        {!isLoading &&
          !loadError &&
          decks.map((d) => (
            <DeckCardItem
              key={d.id}
              id={d.id}
              name={d.name}
              cards={d.cards}
              lastStudied={d.lastStudied}
              created={d.created}
              onEdit={() => openEdit(d.id)}
              onDelete={() => openDelete(d.id)}
              onAddFlashcard={() => openAddFlashcard(d.id)}
              onViewFlashcards={() => openViewFlashcards(d.id)}
            />
          ))}
      </div>

      {/* TABLE for desktop (≥ md) */}
      <div className="hidden md:block overflow-x-auto">
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
                <TableRow key={`sk-${i}`}>
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
              decks.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.cards}</TableCell>
                  <TableCell>{d.lastStudied}</TableCell>
                  <TableCell>{d.created}</TableCell>
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

                        {/* New items */}
                        <DropdownMenuItem
                          onClick={() => openViewFlashcards(d.id)}
                        >
                          View Flashcards
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openAddFlashcard(d.id)}
                        >
                          Add Flashcard
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => openEdit(d.id)}>
                          Edit Deck
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Export Deck</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDelete(d.id)}
                        >
                          Delete Deck
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

/* Mobile/desktop “list” card item */
function DeckCardItem({
  id,
  name,
  cards,
  lastStudied,
  created,
  onEdit,
  onDelete,
  onAddFlashcard,
  onViewFlashcards,
}: {
  id: string;
  name: string;
  cards: number | string;
  lastStudied: string;
  created: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddFlashcard: () => void;
  onViewFlashcards: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border">
            <NotebookText className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{name}</h3>
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {cards} {typeof cards === "number" ? "cards" : ""}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={onViewFlashcards}>
              View Flashcards
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddFlashcard}>
              Add Flashcard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>Edit Deck</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Export Deck</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              Delete Deck
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Last studied: {lastStudied || "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>Created: {created}</span>
        </div>
      </div>
    </div>
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
  }).format(new Date(iso));
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));
}
