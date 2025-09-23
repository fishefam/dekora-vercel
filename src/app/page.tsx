import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { DecksTable } from "@/components/dashboard/decks-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function Page() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Flashcard Decks"
        text="Create and manage your flashcard decks."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deck
        </Button>
      </DashboardHeader>
      <Card>
        <DecksTable />
      </Card>
    </DashboardShell>
  );
}
