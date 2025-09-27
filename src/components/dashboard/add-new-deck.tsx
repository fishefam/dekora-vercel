/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { createDeckAction } from "./decks-table.action";

export function AddNewDeck({
  setRows,
}: {
  setRows: Dispatch<SetStateAction<any[]>>;
}) {
  const [name, setName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deck
        </Button>
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
  );
}
