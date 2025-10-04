"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "@/components/icons";
import { getUserDecksAction, exportDecksGroupedAction } from "./action";

function toCSV(deckName: string, rows: {front:string;back:string;difficulty:number|null}[]) {
  const header = "deck,front,back,difficulty\n";
  const lines = rows.map(r => {
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    return `${esc(deckName)},${esc(r.front)},${esc(r.back)},${r.difficulty ?? ""}`;
  });
  return header + lines.join("\n");
}

function safeFileName(name: string) {
  return name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").slice(0, 100);
}

export default function Page() {
  const [decks, setDecks] = useState<{ id: string; name: string; total_cards: number }[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await getUserDecksAction();
      setDecks(d);
      setLoading(false);
    })();
  }, []);

  const toggleDeck = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const onExportMultiple = async () => {
    const ids = Object.keys(selected).filter(id => selected[id]);
    if (!ids.length) return;

    setExporting(true);
    try {
      const grouped = await exportDecksGroupedAction(ids);
      if (!grouped.length) return;

      // Start one download per deck
      for (const g of grouped) {
        const csv = toCSV(g.deck_name, g.rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${safeFileName(g.deck_name)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Export Flashcards"
        text="Export your flashcards to CSV format for offline study or sharing."
      />

      <Card>
        <CardHeader>
          <CardTitle>Export Decks</CardTitle>
          <CardDescription>Select the decks you want to export.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading decks…</div>
          ) : (
            <div className="space-y-2">
              <Label>Select Decks to Export</Label>
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-4">
                {decks.map((deck) => (
                  <div key={deck.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`deck-${deck.id}`}
                      checked={!!selected[deck.id]}
                      onCheckedChange={() => toggleDeck(deck.id)}
                    />
                    <Label htmlFor={`deck-${deck.id}`}>
                      {deck.name} ({deck.total_cards})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={onExportMultiple}
            disabled={exporting || !Object.values(selected).some(Boolean)}
            title={exporting ? "Preparing files…" : undefined}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting…" : "Export Selected Decks"}
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  );
}
