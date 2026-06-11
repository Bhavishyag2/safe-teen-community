"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";

interface VoteButtonsProps {
  count: number;
  orientation?: "vertical" | "horizontal";
  size?: "default" | "sm";
  onVote?: (direction: "up" | "down") => void;
}

export function VoteButtons({
  count,
  orientation = "vertical",
  size = "default",
  onVote,
}: VoteButtonsProps) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  const [currentCount, setCurrentCount] = React.useState(count);

  const handleVote = (direction: "up" | "down") => {
    if (vote === direction) {
      // Remove vote
      setVote(null);
      setCurrentCount(count);
    } else if (vote === null) {
      // New vote
      setVote(direction);
      setCurrentCount(direction === "up" ? count + 1 : count - 1);
    } else {
      // Switch vote
      setVote(direction);
      setCurrentCount(direction === "up" ? count + 2 : count - 2);
    }
    onVote?.(direction);
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          "rounded-full",
          vote === "up" && "text-orange-500 bg-orange-500/10 vote-active"
        )}
        onClick={() => handleVote("up")}
      >
        <ChevronUp className={iconSize} />
      </Button>

      <span
        className={cn(
          "font-semibold tabular-nums",
          size === "sm" ? "text-xs" : "text-sm",
          vote === "up" && "text-orange-500",
          vote === "down" && "text-blue-500"
        )}
      >
        {formatNumber(currentCount)}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          "rounded-full",
          vote === "down" && "text-blue-500 bg-blue-500/10 vote-active"
        )}
        onClick={() => handleVote("down")}
      >
        <ChevronDown className={iconSize} />
      </Button>
    </div>
  );
}
