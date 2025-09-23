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
import { Flashcard } from "@/components/dashboard/flashcard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shuffle } from "@/components/icons";

export default function Page() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Study Mode"
        text="Review your flashcards and track your progress."
      >
        <div className="flex items-center gap-2">
          <Select defaultValue="javascript">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Deck" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript Basics</SelectItem>
              <SelectItem value="react">React Fundamentals</SelectItem>
              <SelectItem value="nextjs">Next.js Concepts</SelectItem>
              <SelectItem value="css">CSS Properties</SelectItem>
              <SelectItem value="html">HTML Elements</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </DashboardHeader>

      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Mode</TabsTrigger>
          <TabsTrigger value="match">Matching</TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            <Flashcard />
            <div className="mt-8 flex gap-4">
              <Button variant="outline">Previous</Button>
              <Button>Next</Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Card 3 of 10
            </div>
          </div>
        </TabsContent>
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Mode</CardTitle>
              <CardDescription>
                Test your knowledge with multiple choice questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">
                  What is the correct JavaScript syntax to change the content of
                  the HTML element below?
                </h3>
                <pre className="mt-2 rounded bg-muted p-2 font-mono text-sm">
                  &lt;p id=&quot;demo&quot;&gt;This is a
                  demonstration.&lt;/p&gt;
                </pre>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="option1"
                      name="answer"
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="option1"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      document.getElementById(&quot;demo&quot;).innerHTML =
                      &quot;Hello World!&quot;;
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="option2"
                      name="answer"
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="option2"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      #demo.innerHTML = &quot;Hello World!&quot;;
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="option3"
                      name="answer"
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="option3"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      document.getElement(&quot;p&quot;).innerHTML = &quot;Hello
                      World!&quot;;
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="option4"
                      name="answer"
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="option4"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      document.querySelector(&quot;#demo&quot;).innerHTML =
                      &quot;Hello World!&quot;;
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit Answer</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="match" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matching Game</CardTitle>
              <CardDescription>
                Match terms with their definitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Terms</h3>
                  <div className="space-y-2">
                    {[
                      "useState",
                      "useEffect",
                      "useContext",
                      "useReducer",
                      "useMemo",
                    ].map((term, i) => (
                      <div key={i} className="rounded-md border p-3 text-sm">
                        {term}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Definitions</h3>
                  <div className="space-y-2">
                    <div className="rounded-md border p-3 text-sm">
                      Memoizes a value, recalculating only when dependencies
                      change
                    </div>
                    <div className="rounded-md border p-3 text-sm">
                      Manages state with a reducer function, similar to Redux
                    </div>
                    <div className="rounded-md border p-3 text-sm">
                      Accesses context values from a React Context Provider
                    </div>
                    <div className="rounded-md border p-3 text-sm">
                      Performs side effects in function components
                    </div>
                    <div className="rounded-md border p-3 text-sm">
                      Adds state to a function component
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Check Matches</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
