import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { DecksTable } from "@/components/dashboard/decks-table";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Flashcard Decks"
        text="Create and manage your flashcard decks."
      ></DashboardHeader>
      <Card>
        <DecksTable />
      </Card>
    </DashboardShell>
  );
}
