// app/progress/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Overview } from "@/components/dashboard/overview";
import { ProgressStats } from "@/components/dashboard/progress-stats";

import {
  getOverviewAction,
  getProgressSummaryAction,
  type Timeframe,
} from "./action";

export default function Page() {
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getProgressSummaryAction>
  > | null>(null);

  const [series, setSeries] = useState<
    Awaited<ReturnType<typeof getOverviewAction>>
  >([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const [sum, ov] = await Promise.all([
          getProgressSummaryAction(timeframe),
          getOverviewAction(7),
        ]);
        if (!alive) return;
        setSummary(sum);
        setSeries(ov);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [timeframe]);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Progress Tracking"
        text="Monitor your study habits and learning progress."
      >
        <Select
          value={timeframe}
          onValueChange={(v) => setTimeframe(v as Timeframe)}
        >
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProgressStats
          // make sure your component reads these keys:
          // total_decks, total_cards, total_minutes, retention_rate
          // (plus it can still use streaks/last_studied_at if it wants)
          stats={
            summary ?? {
              total_sessions: 0,
              total_cards: 0,
              total_minutes: 0,
              last_studied_at: null,
              current_streak: 0,
              longest_streak: 0,
              total_decks: 0,
              retention_rate: 0,
            }
          }
          loading={loading}
        />
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>
            Your study activity over the past week
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <Overview series={series} loading={loading} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
