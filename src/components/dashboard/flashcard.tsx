"use client";

import { flushSync } from "react-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  front?: React.ReactNode;
  back?: React.ReactNode;
  /** Controlled flip; if provided, component is controlled */
  flipped?: boolean;
  /** Used only when `flipped` is undefined */
  defaultFlipped?: boolean;
  /** Called with next flip state */
  onFlip?: (next: boolean) => void;
  /** Alias for parent APIs */
  onToggle?: () => void;
  className?: string;
};

export function Flashcard({ front, back }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [withTransition, setWithTransition] = useState(true);

  useEffect(() => {
    setFlipped(false);
    setWithTransition(false);
  }, [front]);

  return (
    <div
      className="relative h-[300px] w-full max-w-[500px] cursor-pointer perspective"
      onClick={() => {
        flushSync(() => {
          setWithTransition(true);
        });
        setFlipped(!flipped);
      }}
    >
      <div
        className={cn(
          "absolute inset-0 backface-hidden duration-500",
          withTransition && "transition-all",
          flipped ? "rotate-y-180" : ""
        )}
      >
        <Card className="flex h-full w-full items-center justify-center p-6">
          <CardContent className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold">{front}</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Click to reveal answer
            </p>
          </CardContent>
        </Card>
      </div>
      <div
        className={cn(
          "absolute inset-0 backface-hidden rotate-y-180 transition-all duration-500",
          flipped ? "rotate-y-0" : ""
        )}
      >
        <Card className="flex h-full w-full items-center justify-center p-6 bg-muted/50">
          <CardContent className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <p>{back}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Click to flip back
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
