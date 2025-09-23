import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "@/components/icons";

export default function Page() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Export Flashcards"
        text="Export your flashcards to CSV format for offline study or sharing."
      />

      <Card>
        <CardHeader>
          <CardTitle>Export Decks</CardTitle>
          <CardDescription>
            Select the decks you want to export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Decks to Export</Label>
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-4">
                {[
                  "JavaScript Basics",
                  "React Fundamentals",
                  "Next.js Concepts",
                  "CSS Properties",
                  "HTML Elements",
                  "TypeScript Types",
                  "Git Commands",
                ].map((deck, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox id={`deck-${i}`} />
                    <Label htmlFor={`deck-${i}`}>{deck}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Selected Decks
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  );
}
