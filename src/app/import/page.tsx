"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText } from "@/components/icons";
import { importFlashcardsAction, type ImportRow } from "./action";

// --- tiny CSV parser (handles quotes, commas, newlines) ---
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'; // escaped quote
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += c;
        i++;
        continue;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i++;
        continue;
      }
      if (c === "\r") {
        i++;
        continue; // ignore CR
      }
      field += c;
      i++;
      continue;
    }
  }
  // last field
  row.push(field);
  rows.push(row);
  // drop possible empty trailing row
  if (rows.length && rows[rows.length - 1].every((v) => v === "")) rows.pop();
  return rows;
}

type PreviewRow = { front: string; back: string; difficulty?: number | null };

export default function Page() {
  const [deckName, setDeckName] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // drag & drop
  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) await handleFile(f);
  }, []);

  const onBrowseClick = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await handleFile(f);
  };

  async function handleFile(file: File) {
    setParsingError(null);
    setResultMsg(null);
    setFileName(file.name);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv") {
      setParsingError("Please upload a .csv file.");
      setRows([]);
      return;
    }

    const text = await file.text();
    const table = parseCSV(text);

    if (!table.length) {
      setParsingError("The file appears to be empty.");
      setRows([]);
      return;
    }

    // header detection: look for "front/back[/difficulty]" in first row
    let startIdx = 0;
    const header = table[0].map((s) => s.trim().toLowerCase());
    const looksLikeHeader = header.includes("front") && header.includes("back");

    const fIdx = looksLikeHeader ? header.indexOf("front") : 0;
    const bIdx = looksLikeHeader ? header.indexOf("back") : 1;
    const dIdx = looksLikeHeader ? header.indexOf("difficulty") : -1;

    if (looksLikeHeader) startIdx = 1;

    const parsed: PreviewRow[] = [];
    for (let i = startIdx; i < table.length; i++) {
      const r = table[i];
      if (!r) continue;
      const front = (r[fIdx] ?? "").trim();
      const back = (r[bIdx] ?? "").trim();
      const difficultyRaw = dIdx >= 0 ? (r[dIdx] ?? "").trim() : "";
      const difficulty = difficultyRaw === "" ? null : Number(difficultyRaw);

      if (!front && !back) continue;
      parsed.push({
        front,
        back,
        difficulty: Number.isFinite(difficulty) ? difficulty : null,
      });
    }

    if (!parsed.length) {
      setParsingError(
        "No valid rows found. Make sure the CSV has columns front, back[, difficulty]."
      );
    }

    setRows(parsed);
  }

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const onImport = async () => {
    setResultMsg(null);
    setParsingError(null);

    if (!deckName.trim()) {
      setParsingError("Deck name is required.");
      return;
    }
    if (!rows.length) {
      setParsingError("No rows to import.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: ImportRow[] = rows.map((r, i) => ({
        front: r.front,
        back: r.back,
        difficulty: r.difficulty ?? null,
        position: i + 1,
      }));

      const res = await importFlashcardsAction({
        deckName: deckName.trim(),
        rows: payload,
      });

      setResultMsg(res.message ?? (res.ok ? "Imported." : "Failed."));
      if (res.ok) {
        // Clear rows but keep deck name so the user can import again into same deck name if desired
        setRows([]);
        setFileName("");
      }
    } catch (e: any) {
      setParsingError(e?.message ?? "Import failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Import Flashcards"
        text="Import flashcards from CSV file."
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Drop zone */}
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center"
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
            <h3 className="pb-5 text-lg font-medium">
              Drag and drop your CSV here
            </h3>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileChange}
            />
            <Button onClick={onBrowseClick} disabled={submitting}>
              <FileText className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            {fileName && (
              <div className="mt-3 text-sm text-muted-foreground">
                Selected: <span className="font-medium">{fileName}</span>
              </div>
            )}
          </div>

          {/* Deck name */}
          <div className="space-y-2">
            <Label htmlFor="deck-name">Deck Name</Label>
            <Input
              id="deck-name"
              placeholder="Enter a name for the imported deck"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div className="rounded-md border p-4">
              <div className="mb-2 text-sm font-medium">
                Preview ({Math.min(5, rows.length)} of {rows.length})
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {preview.map((r, idx) => (
                  <div key={idx} className="rounded border p-2">
                    <div className="text-xs text-muted-foreground">Front</div>
                    <div className="text-sm">{r.front}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Back
                    </div>
                    <div className="text-sm">{r.back}</div>
                    {r.difficulty != null && (
                      <>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Difficulty
                        </div>
                        <div className="text-sm">{r.difficulty}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsingError && (
            <div className="text-sm text-destructive">{parsingError}</div>
          )}
          {resultMsg && (
            <div className="text-sm text-muted-foreground">{resultMsg}</div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={onImport}
            disabled={submitting || rows.length === 0 || !deckName.trim()}
          >
            {submitting ? "Importing..." : "Import Flashcards"}
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  );
}
