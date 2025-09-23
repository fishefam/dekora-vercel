"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function Flashcard() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative h-[300px] w-full max-w-[500px] cursor-pointer perspective"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={cn("absolute inset-0 backface-hidden transition-all duration-500", flipped ? "rotate-y-180" : "")}
      >
        <Card className="flex h-full w-full items-center justify-center p-6">
          <CardContent className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold">What is the purpose of the useEffect hook in React?</h3>
            <p className="mt-4 text-sm text-muted-foreground">Click to reveal answer</p>
          </CardContent>
        </Card>
      </div>
      <div
        className={cn(
          "absolute inset-0 backface-hidden rotate-y-180 transition-all duration-500",
          flipped ? "rotate-y-0" : "",
        )}
      >
        <Card className="flex h-full w-full items-center justify-center p-6 bg-muted/50">
          <CardContent className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <p>
              The useEffect hook in React is used to perform side effects in function components. Side effects could be
              data fetching, subscriptions, manual DOM manipulations, or any code that needs to interact with the
              outside world.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Click to flip back</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

