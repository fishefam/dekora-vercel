"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type OverviewPoint = { date: string; cards: number; sessions: number; correct_rate: number | null }

type OverviewProps = {
  /** Pass the 7-day series from your server action */
  series?: OverviewPoint[]
  /** Optional loading flag for skeleton UI */
  loading?: boolean
}

const demo = [
  { name: "Mon", cards: 35 },
  { name: "Tue", cards: 28 },
  { name: "Wed", cards: 45 },
  { name: "Thu", cards: 52 },
  { name: "Fri", cards: 30 },
  { name: "Sat", cards: 25 },
  { name: "Sun", cards: 30 },
]

export function Overview({ series, loading }: OverviewProps) {
  // Map server series -> chart data (labels as weekday short, e.g. Mon/Tue)
  const chartData = useMemo(() => {
    if (!series || series.length === 0) return demo
    return series.map((p) => {
      const d = new Date(p.date) // expecting "YYYY-MM-DD"
      const name = d.toLocaleDateString(undefined, { weekday: "short" }) // Mon, Tue, ...
      return { name, cards: p.cards }
    })
  }, [series])

  return (
    <div className="w-full">
      {loading ? (
        <div className="h-[350px] w-full animate-pulse rounded-md bg-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Bar
              dataKey="cards"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
