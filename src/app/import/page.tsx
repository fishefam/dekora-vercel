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
import { Upload, FileText } from "lucide-react";

export default function Page() {
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
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-medium pb-5">
              Drag and drop your file here
            </h3>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deck-name">Deck Name</Label>
              <Input
                id="deck-name"
                placeholder="Enter a name for the imported deck"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Import Flashcards</Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  );
}
