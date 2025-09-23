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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Printer } from "lucide-react";

export default function Page() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Export Flashcards"
        text="Export your flashcards to various formats for offline study or sharing."
      />

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="print">Print</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Decks</CardTitle>
              <CardDescription>
                Select the decks you want to export and choose a format.
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

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <RadioGroup defaultValue="csv">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv">CSV (Comma Separated Values)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="json" id="json" />
                      <Label htmlFor="json">
                        JSON (JavaScript Object Notation)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf">PDF Document</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anki" id="anki" />
                      <Label htmlFor="anki">Anki Package (.apkg)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Export Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-tags" defaultChecked />
                      <Label htmlFor="include-tags">Include tags</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-metadata" defaultChecked />
                      <Label htmlFor="include-metadata">
                        Include metadata (creation date, last studied)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-images" defaultChecked />
                      <Label htmlFor="include-images">Include images</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-study-history" />
                      <Label htmlFor="include-study-history">
                        Include study history
                      </Label>
                    </div>
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
        </TabsContent>

        <TabsContent value="print" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Print Flashcards</CardTitle>
              <CardDescription>
                Print your flashcards for physical study.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Deck to Print</Label>
                  <RadioGroup defaultValue="javascript">
                    {[
                      "JavaScript Basics",
                      "React Fundamentals",
                      "Next.js Concepts",
                      "CSS Properties",
                      "HTML Elements",
                    ].map((deck, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={deck.toLowerCase().replace(/\s+/g, "-")}
                          id={`print-deck-${i}`}
                        />
                        <Label htmlFor={`print-deck-${i}`}>{deck}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Print Layout</Label>
                  <RadioGroup defaultValue="2x2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2x2" id="layout-2x2" />
                      <Label htmlFor="layout-2x2">
                        2x2 Grid (4 cards per page)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3x3" id="layout-3x3" />
                      <Label htmlFor="layout-3x3">
                        3x3 Grid (9 cards per page)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="layout-single" />
                      <Label htmlFor="layout-single">
                        Single Card (front and back)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Print Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="print-double-sided" defaultChecked />
                      <Label htmlFor="print-double-sided">
                        Double-sided printing
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="print-include-lines" defaultChecked />
                      <Label htmlFor="print-include-lines">
                        Include cut lines
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="print-include-qr" />
                      <Label htmlFor="print-include-qr">
                        Include QR code link to online deck
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print Flashcards
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
