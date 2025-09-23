import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { ProgressStats } from '@/components/dashboard/progress-stats'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProgressPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Progress Tracking"
        text="Monitor your study habits and learning progress."
      >
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="day">Today</SelectItem>
          </SelectContent>
        </Select>
      </DashboardHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="decks">By Deck</TabsTrigger>
          <TabsTrigger value="time">Study Time</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ProgressStats />
          </div>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>
                Your study activity over the past week
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="decks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress by Deck</CardTitle>
              <CardDescription>
                Your mastery level for each deck
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'JavaScript Basics',
                    progress: 85,
                    cards: 48,
                    mastered: 41,
                  },
                  {
                    name: 'React Fundamentals',
                    progress: 62,
                    cards: 35,
                    mastered: 22,
                  },
                  {
                    name: 'Next.js Concepts',
                    progress: 45,
                    cards: 30,
                    mastered: 14,
                  },
                  {
                    name: 'CSS Properties',
                    progress: 78,
                    cards: 50,
                    mastered: 39,
                  },
                  {
                    name: 'HTML Elements',
                    progress: 92,
                    cards: 40,
                    mastered: 37,
                  },
                ].map((deck, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{deck.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {deck.mastered} of {deck.cards} cards mastered
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {deck.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${deck.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Time Distribution</CardTitle>
              <CardDescription>
                How you&apos;ve spent your study time across different decks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] w-full items-center justify-center">
                <div className="relative h-[220px] w-[220px] rounded-full">
                  {/* Simple pie chart visualization */}
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#4f46e5]"
                    style={{
                      clipPath: 'polygon(50% 50%, 100% 50%, 100% 0, 50% 0)',
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#8b5cf6]"
                    style={{ clipPath: 'polygon(50% 50%, 50% 0, 0 0, 0 50%)' }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#ec4899]"
                    style={{
                      clipPath: 'polygon(50% 50%, 0 50%, 0 100%, 50% 100%)',
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#f43f5e]"
                    style={{
                      clipPath:
                        'polygon(50% 50%, 50% 100%, 100% 100%, 100% 75%)',
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#f97316]"
                    style={{ clipPath: 'polygon(50% 50%, 100% 75%, 100% 50%)' }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">5.2h</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardContent>
              <div className="flex h-[300px] w-full items-center justify-center">
                <div className="relative h-[220px] w-[220px] rounded-full">
                  {/* Simple pie chart visualization */}
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#4f46e5]"
                    style={{
                      clipPath: 'polygon(50% 50%, 100% 50%, 100% 0, 50% 0)',
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#8b5cf6]"
                    style={{ clipPath: 'polygon(50% 50%, 50% 0, 0 0, 0 50%)' }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#ec4899]"
                    style={{
                      clipPath: 'polygon(50% 50%, 0 50%, 0 100%, 50% 100%)',
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#f43f5e]"
                    style={{
                      clipPath:
                        'polygon(50% 50%, 50% 100%, 100% 100%, 100% 75%)',
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#f97316]"
                    style={{ clipPath: 'polygon(50% 50%, 100% 75%, 100% 50%)' }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">5.2h</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-[#4f46e5]"></div>
                    <span className="text-sm">JavaScript (30%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-[#8b5cf6]"></div>
                    <span className="text-sm">React (25%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-[#ec4899]"></div>
                    <span className="text-sm">Next.js (20%)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-[#f43f5e]"></div>
                    <span className="text-sm">CSS (15%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-[#f97316]"></div>
                    <span className="text-sm">HTML (10%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
