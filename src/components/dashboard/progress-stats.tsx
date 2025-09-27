"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Clock, BarChart3 } from "@/components/icons"

type ProgressStatsProps = {
  stats?: {
    total_decks: number
    total_cards: number
    total_minutes: number
    retention_rate: number
    decks_change?: string
    cards_change?: string
    minutes_change?: string
    retention_change?: string
  }
  loading?: boolean
}

export function ProgressStats({ stats, loading }: ProgressStatsProps) {
  const data = stats ?? {
    total_decks: 0,
    total_cards: 0,
    total_minutes: 0,
    retention_rate: 0,
    decks_change: "+0",
    cards_change: "+0",
    minutes_change: "+0",
    retention_change: "+0",
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "—" : data.total_decks}</div>
          <p className="text-xs text-muted-foreground">
            {loading ? "…" : data.decks_change ?? ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cards Studied</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "—" : data.total_cards}</div>
          <p className="text-xs text-muted-foreground">
            {loading ? "…" : data.cards_change ?? ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "—" : `${data.total_minutes}m`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "…" : data.minutes_change ?? ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "—" : `${data.retention_rate}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "…" : data.retention_change ?? ""}
          </p>
        </CardContent>
      </Card>
    </>
  )
}
