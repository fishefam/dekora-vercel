import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentDecks() {
  return (
    <div className="space-y-8">
      {[
        {
          name: "JavaScript Basics",
          lastStudied: "2 hours ago",
          progress: 85,
          cards: 48,
          initials: "JS",
        },
        {
          name: "React Fundamentals",
          lastStudied: "Yesterday",
          progress: 62,
          cards: 35,
          initials: "RF",
        },
        {
          name: "Next.js Concepts",
          lastStudied: "2 days ago",
          progress: 45,
          cards: 30,
          initials: "NC",
        },
        {
          name: "CSS Properties",
          lastStudied: "3 days ago",
          progress: 78,
          cards: 50,
          initials: "CP",
        },
        {
          name: "HTML Elements",
          lastStudied: "5 days ago",
          progress: 92,
          cards: 40,
          initials: "HE",
        },
      ].map((deck, i) => (
        <div key={i} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{deck.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{deck.name}</p>
            <p className="text-sm text-muted-foreground">
              {deck.cards} cards · {deck.lastStudied}
            </p>
          </div>
          <div className="ml-auto font-medium">{deck.progress}%</div>
        </div>
      ))}
    </div>
  )
}

