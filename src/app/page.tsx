import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { DecksTable } from '@/components/dashboard/decks-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'

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
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Decks</TabsTrigger>
          <TabsTrigger value="recent">Recently Studied</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <DecksTable />
          </Card>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <DecksTable filter="recent" />
          </Card>
        </TabsContent>
        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <DecksTable filter="favorites" />
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
