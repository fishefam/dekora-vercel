// app/review/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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

import {
  getDecksForReviewAction,
  getDeckCardsAction,
  recordStudyEventAction,
  getDeckCategoriesAction,
  type ReviewDeck,
  type ReviewCard,
} from "./page.action";

type ReviewCategory = { id: string; name: string };

// ---------- helpers ----------
function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 1 correct + 3 random other backs */
function buildQuizOptionsStrict(
  cards: ReviewCard[],
  idx: number
): { options: string[]; correct: string } {
  if (!cards.length || !cards[idx]) return { options: [], correct: "" };
  const correct = (cards[idx].back ?? "").trim();

  const others = Array.from(
    new Set(
      cards
        .map((c, i) => (i === idx ? null : (c.back ?? "").trim()))
        .filter((v): v is string => !!v && v !== correct)
    )
  );

  const distractors = shuffleArray(others).slice(0, 3);
  const options = shuffleArray([correct, ...distractors]);
  return { options, correct };
}

/** Group by difficulty -> shuffled indices */
function makeDifficultyPools(cards: ReviewCard[]) {
  const pools: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  cards.forEach((c, i) => {
    const d = Math.min(5, Math.max(1, Number(c.difficulty) || 1));
    pools[d].push(i);
  });
  (Object.keys(pools) as unknown as (keyof typeof pools)[]).forEach(
    (k) => (pools[k] = shuffleArray(pools[k]))
  );
  return pools;
}

// ---------- component ----------
export default function Page() {
  // categories (for decks.category_id)
  const [categories, setCategories] = useState<ReviewCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // decks/select
  const [decks, setDecks] = useState<ReviewDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>(
    undefined
  );
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);

  // cards/review
  const [rawCards, setRawCards] = useState<ReviewCard[]>([]);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // NEW: difficulty filter (affects flashcards + quiz for the selected deck)
  // "all" = no filter, else 1..5
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "1" | "2" | "3" | "4" | "5">("all");

  // quiz state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState<string>("");

  // difficulty sequencing (for quiz)
  const [pools, setPools] = useState<Record<number, number[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const [level, setLevel] = useState<number>(1);
  const [servedAtLevel, setServedAtLevel] = useState<number>(0); // 0..2 (~3 per level)

  // feedback + progress
  const [answered, setAnswered] = useState<null | boolean>(null); // null | true | false
  const [askedCount, setAskedCount] = useState<number>(0); // for progress bar
  const [countdown, setCountdown] = useState<number | null>(null); // 3..0 on correct

  // load categories for dropdown
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoadingCategories(true);
      try {
        const cats = await getDeckCategoriesAction();
        if (!alive) return;
        setCategories(cats ?? []);
      } finally {
        if (alive) setIsLoadingCategories(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // load decks (filtered by categoryId)
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoadingDecks(true);
      const d = await getDecksForReviewAction(
        categoryId ? { categoryId } : undefined
      );
      if (!alive) return;
      setDecks(d);

      // if current selection is not in filtered list, pick the first
      if (!d.find((x) => x.id === selectedDeckId)) {
        setSelectedDeckId(d[0]?.id);
      }
      setIsLoadingDecks(false);
    })();
    return () => {
      alive = false;
    };
  }, [categoryId]);

  // load cards when deck changes
  useEffect(() => {
    if (!selectedDeckId) return;
    let alive = true;
    (async () => {
      setIsLoadingCards(true);
      const data = await getDeckCardsAction({ deckId: selectedDeckId });
      if (!alive) return;

      setRawCards(data); // keep raw list for in-page filters

      // apply current difficulty filter immediately
      const difficultyNum =
        difficultyFilter === "all" ? null : Number(difficultyFilter);
      const filtered =
        difficultyNum === null
          ? data
          : data.filter(
              (c) => Math.min(5, Math.max(1, Number(c.difficulty) || 1)) === difficultyNum
            );

      // update derived state from filtered list
      setCards(filtered);

      const newPools = makeDifficultyPools(filtered);
      setPools(newPools);

      const firstLevel =
        ([1, 2, 3, 4, 5] as const).find((d) => newPools[d].length > 0) ?? 1;
      setLevel(firstLevel);
      setServedAtLevel(0);

      let firstIndex = 0;
      if (newPools[firstLevel]?.length) {
        const arr = [...newPools[firstLevel]];
        firstIndex = arr.shift()!;
        setPools({ ...newPools, [firstLevel]: arr });
      }
      setIndex(firstIndex);

      // reset UI states
      setShowAnswer(false);
      setSelectedOption(null);
      setAnswered(null);
      setAskedCount(0);
      setCountdown(null);

      setIsLoadingCards(false);
    })();
    return () => {
      alive = false;
    };
  }, [selectedDeckId]);

  // when difficulty filter changes, re-derive cards/pools/index from rawCards
  useEffect(() => {
    const difficultyNum =
      difficultyFilter === "all" ? null : Number(difficultyFilter);
    const filtered =
      difficultyNum === null
        ? rawCards
        : rawCards.filter(
            (c) => Math.min(5, Math.max(1, Number(c.difficulty) || 1)) === difficultyNum
          );

    setCards(filtered);

    const newPools = makeDifficultyPools(filtered);
    setPools(newPools);

    const firstLevel =
      ([1, 2, 3, 4, 5] as const).find((d) => newPools[d].length > 0) ?? 1;
    setLevel(firstLevel);
    setServedAtLevel(0);

    let firstIndex = 0;
    if (newPools[firstLevel]?.length) {
      const arr = [...newPools[firstLevel]];
      firstIndex = arr.shift()!;
      setPools({ ...newPools, [firstLevel]: arr });
    }
    setIndex(firstIndex);

    // reset UI states
    setShowAnswer(false);
    setSelectedOption(null);
    setAnswered(null);
    setAskedCount(0);
    setCountdown(null);
  }, [difficultyFilter, rawCards]);

  // regenerate quiz options whenever the current question changes
  useEffect(() => {
    const { options, correct } = buildQuizOptionsStrict(cards, index);
    setQuizOptions(options);
    setQuizCorrectAnswer(correct);
    setSelectedOption(null);
    setAnswered(null);
    setCountdown(null);
  }, [cards, index]);

  const current = cards[index];
  const canPrev = index > 0;
  const canNext = index < Math.max(cards.length - 1, 0);

  // ---------- review tab actions ----------
  const onPrev = async () => {
    if (!canPrev) return;
    setIndex((i) => Math.max(0, i - 1));
    setShowAnswer(false);
    setSelectedOption(null);
    setCountdown(null);
  };
  const onNext = async () => {
    if (!canNext) return;
    setIndex((i) => Math.min(cards.length - 1, i + 1));
    setShowAnswer(false);
    setSelectedOption(null);
    setCountdown(null);
  };
  const onShuffle = () => {
    if (!cards.length) return;
    const s = shuffleArray(cards);
    setCards(s);

    const newPools = makeDifficultyPools(s);
    setPools(newPools);
    const firstLevel =
      ([1, 2, 3, 4, 5] as const).find((d) => newPools[d].length > 0) ?? 1;
    setLevel(firstLevel);
    setServedAtLevel(0);
    let firstIndex = 0;
    if (newPools[firstLevel]?.length) {
      const arr = [...newPools[firstLevel]];
      firstIndex = arr.shift()!;
      setPools({ ...newPools, [firstLevel]: arr });
    }
    setIndex(firstIndex);
    setShowAnswer(false);
    setSelectedOption(null);
    setAnswered(null);
    setAskedCount(0);
    setCountdown(null);
  };

  // ---------- quiz flow helpers ----------
  function moveToNextAvailableLevel(start: number) {
    let lv = start;
    while (lv <= 5 && (pools[lv]?.length ?? 0) === 0) lv++;

    if (lv > 5) {
      // exhausted — rebuild and start again
      const newPools = makeDifficultyPools(cards);
      setPools(newPools);
      const first =
        ([1, 2, 3, 4, 5] as const).find((d) => newPools[d].length > 0) ?? 1;
      setLevel(first);
      setServedAtLevel(0);
      const arr = [...newPools[first]];
      const nextIdx = arr.shift() ?? index;
      setPools({ ...newPools, [first]: arr });
      setIndex(nextIdx);
      setSelectedOption(null);
      setAnswered(null);
      setCountdown(null);
      return;
    }

    setLevel(lv);
    setServedAtLevel(0);
    const arr = pools[lv];
    const nextIdx = arr[0];
    setPools((p) => ({ ...p, [lv]: p[lv].slice(1) }));
    setIndex(nextIdx);
    setSelectedOption(null);
    setAnswered(null);
    setCountdown(null);
  }

  function advanceLevelAware() {
    const pool = pools[level] ?? [];
    // ~3 per level (0,1,2)
    if (servedAtLevel >= 2) {
      moveToNextAvailableLevel(level + 1);
      return;
    }
    if (pool.length > 0) {
      const nextIdx = pool[0];
      setPools((p) => ({ ...p, [level]: p[level].slice(1) }));
      setIndex(nextIdx);
      setServedAtLevel((n) => n + 1);
      setSelectedOption(null);
      setAnswered(null);
      setCountdown(null);
      return;
    }
    moveToNextAvailableLevel(level + 1);
  }

  // ---------- quiz submit ----------
  const onSubmitAnswer = async () => {
    if (!selectedOption || !selectedDeckId || !current) return;

    const isCorrect = selectedOption === quizCorrectAnswer;

    // UI: lock and show feedback
    setAnswered(isCorrect);
    setAskedCount((c) => c + 1);

    // fire-and-forget log
    recordStudyEventAction({
      deckId: selectedDeckId,
      cardId: current.id,
      event: "answer",
      correct: isCorrect,
    });

    if (isCorrect) {
      // start 3-second countdown before auto-advance
      setCountdown(3);
    }
    // wrong answer: wait for "Next Question" button
  };

  // countdown effect — tick every second; when 0, advance
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      advanceLevelAware();
      return;
    }

    const t = setTimeout(() => setCountdown((c) => (c ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const onNextAfterWrong = () => {
    advanceLevelAware();
  };

  // progress bar: asked / total
  const progressPct = cards.length
    ? Math.min(100, Math.round((askedCount / cards.length) * 100))
    : 0;

  // precompute options
  const quizRender = useMemo(
    () => buildQuizOptionsStrict(cards, index),
    [cards, index]
  );
  useEffect(() => {
    setQuizOptions(quizRender.options);
    setQuizCorrectAnswer(quizRender.correct);
    setSelectedOption(null);
    setAnswered(null);
    setCountdown(null);
  }, [quizRender.options, quizRender.correct]);

  const currentDifficulty = Math.min(
    5,
    Math.max(1, Number(current?.difficulty) || level)
  );

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Review"
        text="Review your flashcards and track your progress."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Category dropdown (decks.category_id) */}
          <Select
            value={categoryId ?? "all"}
            onValueChange={(v) => setCategoryId(v === "all" ? undefined : v)}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Deck dropdown (filtered by category) */}
          <Select
            value={selectedDeckId}
            onValueChange={(v) => setSelectedDeckId(v)}
            disabled={isLoadingDecks || decks.length === 0}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name} {d.total_cards ? `(${d.total_cards})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* NEW: Difficulty filter for current deck's flashcards */}
          <Select
            value={difficultyFilter}
            onValueChange={(v: "all" | "1" | "2" | "3" | "4" | "5") => setDifficultyFilter(v)}
            disabled={isLoadingCards}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="1">Difficulty 1</SelectItem>
              <SelectItem value="2">Difficulty 2</SelectItem>
              <SelectItem value="3">Difficulty 3</SelectItem>
              <SelectItem value="4">Difficulty 4</SelectItem>
              <SelectItem value="5">Difficulty 5</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={onShuffle}
            disabled={isLoadingCards || cards.length < 2}
            title="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </DashboardHeader>

      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Mode</TabsTrigger>
        </TabsList>

        {/* FLASHCARDS */}
        <TabsContent value="cards" className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            <Flashcard
              key={`${selectedDeckId ?? "none"}:${cards[index]?.id ?? "empty"}`}
              front={
                current?.front ?? (isLoadingCards ? "Loading..." : "No cards")
              }
              back={current?.back ?? ""}
              flipped={!!showAnswer}
              onFlip={() => setShowAnswer((s) => !s)}
              onToggle={() => setShowAnswer((s) => !s)}
            />
            <div className="mt-8 flex gap-4">
              <Button variant="outline" onClick={onPrev} disabled={!canPrev}>
                Previous
              </Button>
              <Button onClick={onNext} disabled={!canNext}>
                Next
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedDeckId
                ? cards.length
                  ? `Card ${index + 1} of ${cards.length}`
                  : "No cards to review"
                : "Select Deck"}
            </div>
          </div>
        </TabsContent>

        {/* QUIZ */}
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Mode</CardTitle>
              <CardDescription>
                Test your knowledge with multiple choice questions
              </CardDescription>

              {/* progress bar */}
              <div className="mt-2 h-2 w-full rounded bg-muted">
                <div
                  className="h-2 rounded bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                {/* difficulty line */}
                <div className="mb-2 text-sm text-green-700 dark:text-green-400">
                  Difficulty: {currentDifficulty}
                </div>

                <h3 className="text-lg font-medium">
                  {current ? current.front : "Choose a deck to begin"}
                </h3>

                <div className="mt-4 space-y-2">
                  {quizOptions.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect =
                      answered !== null && opt === quizCorrectAnswer;
                    const isWrongSelected =
                      answered === false &&
                      isSelected &&
                      opt !== quizCorrectAnswer;

                    const rowClass =
                      answered === null
                        ? ""
                        : isCorrect
                        ? "rounded border border-green-500/50 bg-green-500/10"
                        : isWrongSelected
                        ? "rounded border border-red-500/50 bg-red-500/10"
                        : "opacity-80";

                    return (
                      <label
                        key={i}
                        htmlFor={`option${i + 1}`}
                        className={`flex cursor-pointer items-center gap-2 p-1 ${rowClass}`}
                      >
                        <input
                          type="radio"
                          id={`option${i + 1}`}
                          name="answer"
                          className="h-4 w-4"
                          value={opt}
                          checked={isSelected}
                          onChange={() => setSelectedOption(opt)}
                          disabled={!current || answered !== null}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {/* feedback */}
                {answered === false && (
                  <div className="mt-3 text-sm">
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Incorrect.
                    </span>{" "}
                    Correct answer:{" "}
                    <span className="font-medium">{quizCorrectAnswer}</span>
                  </div>
                )}
                {answered === true && (
                  <div className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
                    Correct!{" "}
                    {countdown !== null && `Next question in ${countdown}...`}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              {answered === false ? (
                <Button className="w-full" onClick={onNextAfterWrong}>
                  Next Question
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={onSubmitAnswer}
                  disabled={!current || !selectedOption || answered === true}
                  title={answered === true ? "Advancing..." : undefined}
                >
                  Submit Answer
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
