import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Page() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Import Flashcards"
        text="Import flashcards from various file formats or external services."
      />

      <Tabs defaultValue="file" className="space-y-4">
        <TabsList>
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="csv">CSV Template</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Upload a CSV, JSON, or Excel file containing your flashcards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-medium">
                  Drag and drop your file here
                </h3>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">
                  Supports CSV, JSON, and Excel files up to 10MB
                </p>
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

                <div className="space-y-2">
                  <Label>Import Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="skip-header" />
                      <Label htmlFor="skip-header">Skip header row</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="replace-duplicates" />
                      <Label htmlFor="replace-duplicates">
                        Replace duplicates
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="create-new-deck" defaultChecked />
                      <Label htmlFor="create-new-deck">
                        Create as new deck
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Import Flashcards</Button>
            </CardFooter>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>File Format Requirements</AlertTitle>
            <AlertDescription>
              Your file should have at least two columns: one for the front of
              the card (question) and one for the back (answer). Additional
              columns can be imported as tags or metadata.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Template</CardTitle>
              <CardDescription>
                Download our CSV template and fill it with your flashcards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p>
                  Our CSV template is designed to make importing flashcards as
                  easy as possible. Download the template, add your flashcards,
                  and upload it back to Deckora.
                </p>

                <div className="rounded-md bg-muted p-4">
                  <h4 className="mb-2 text-sm font-medium">
                    CSV Format Example:
                  </h4>
                  <pre className="overflow-auto text-xs">
                    front,back,tags,notes
                    <br />
                    &quot;What is React?&quot;,&quot;A JavaScript library for
                    building user
                    interfaces&quot;,&quot;javascript,frontend&quot;,&quot;Created
                    by Facebook&quot;
                    <br />
                    &quot;What is JSX?&quot;,&quot;A syntax extension for
                    JavaScript&quot;,&quot;javascript,react&quot;,&quot;Looks
                    like HTML but is JavaScript&quot;
                  </pre>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
