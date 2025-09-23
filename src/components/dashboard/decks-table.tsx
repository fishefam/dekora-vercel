import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Star } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DecksTableProps {
  filter?: "all" | "recent" | "favorites"
}

export function DecksTable({ filter = "all" }: DecksTableProps) {
  // Sample data - in a real app, this would come from a database
  const allDecks = [
    {
      id: "1",
      name: "JavaScript Basics",
      cards: 48,
      lastStudied: "2 hours ago",
      created: "2023-10-15",
      isFavorite: true,
    },
    {
      id: "2",
      name: "React Fundamentals",
      cards: 35,
      lastStudied: "Yesterday",
      created: "2023-11-02",
      isFavorite: true,
    },
    {
      id: "3",
      name: "Next.js Concepts",
      cards: 30,
      lastStudied: "2 days ago",
      created: "2023-12-10",
      isFavorite: false,
    },
    {
      id: "4",
      name: "CSS Properties",
      cards: 50,
      lastStudied: "3 days ago",
      created: "2024-01-05",
      isFavorite: false,
    },
    {
      id: "5",
      name: "HTML Elements",
      cards: 40,
      lastStudied: "5 days ago",
      created: "2024-01-20",
      isFavorite: true,
    },
    {
      id: "6",
      name: "TypeScript Types",
      cards: 45,
      lastStudied: "1 week ago",
      created: "2024-02-01",
      isFavorite: false,
    },
    {
      id: "7",
      name: "Git Commands",
      cards: 25,
      lastStudied: "2 weeks ago",
      created: "2024-02-15",
      isFavorite: false,
    },
  ]

  // Filter decks based on the selected filter
  const decks =
    filter === "all"
      ? allDecks
      : filter === "favorites"
        ? allDecks.filter((deck) => deck.isFavorite)
        : allDecks.slice(0, 5) // For "recent" filter, just show the first 5 decks

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Name</TableHead>
          <TableHead>Cards</TableHead>
          <TableHead>Last Studied</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {decks.map((deck) => (
          <TableRow key={deck.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                {deck.isFavorite && <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />}
                {deck.name}
              </div>
            </TableCell>
            <TableCell>{deck.cards}</TableCell>
            <TableCell>{deck.lastStudied}</TableCell>
            <TableCell>{deck.created}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Study Now</DropdownMenuItem>
                  <DropdownMenuItem>Edit Deck</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Share Deck</DropdownMenuItem>
                  <DropdownMenuItem>Export Deck</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete Deck</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

