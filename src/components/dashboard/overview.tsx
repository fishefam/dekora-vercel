"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Mon",
    cards: 35,
    time: 40,
  },
  {
    name: "Tue",
    cards: 28,
    time: 30,
  },
  {
    name: "Wed",
    cards: 45,
    time: 60,
  },
  {
    name: "Thu",
    cards: 52,
    time: 70,
  },
  {
    name: "Fri",
    cards: 30,
    time: 35,
  },
  {
    name: "Sat",
    cards: 25,
    time: 25,
  },
  {
    name: "Sun",
    cards: 30,
    time: 30,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="cards" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

