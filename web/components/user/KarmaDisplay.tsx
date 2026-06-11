"use client";

import * as React from "react";
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatNumber } from "@/lib/utils";

interface KarmaDisplayProps {
  karma: number;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  size?: "sm" | "default" | "lg";
  showBreakdown?: boolean;
  postKarma?: number;
  commentKarma?: number;
  className?: string;
}

const sizeClasses = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-lg",
};

const iconSizes = {
  sm: "h-3 w-3",
  default: "h-4 w-4",
  lg: "h-5 w-5",
};

export function KarmaDisplay({
  karma,
  trend = "stable",
  trendValue,
  size = "default",
  showBreakdown = false,
  postKarma = 0,
  commentKarma = 0,
  className,
}: KarmaDisplayProps) {
  const trendIcon = {
    up: <TrendingUp className={cn(iconSizes[size], "text-green-500")} />,
    down: <TrendingDown className={cn(iconSizes[size], "text-red-500")} />,
    stable: <Minus className={cn(iconSizes[size], "text-muted-foreground")} />,
  };

  const content = (
    <div className={cn("flex items-center gap-1.5", sizeClasses[size], className)}>
      <Zap className={cn(iconSizes[size], "text-amber-500")} />
      <span className="font-semibold">{formatNumber(karma)}</span>
      <span className="text-muted-foreground">karma</span>
      {trendValue !== undefined && (
        <span className="flex items-center gap-0.5 ml-1">
          {trendIcon[trend]}
          {trend !== "stable" && (
            <span
              className={cn(
                "text-xs",
                trend === "up" ? "text-green-500" : "text-red-500"
              )}
            >
              {trend === "up" ? "+" : "-"}
              {trendValue}
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (showBreakdown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="cursor-default">{content}</button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Karma Breakdown</p>
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-muted-foreground">Post Karma</span>
                <span>{formatNumber(postKarma)}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-muted-foreground">Comment Karma</span>
                <span>{formatNumber(commentKarma)}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

interface KarmaProgressProps {
  currentKarma: number;
  nextMilestone: number;
  milestoneName: string;
  className?: string;
}

export function KarmaProgress({
  currentKarma,
  nextMilestone,
  milestoneName,
  className,
}: KarmaProgressProps) {
  const progress = Math.min((currentKarma / nextMilestone) * 100, 100);
  const remaining = nextMilestone - currentKarma;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Next: {milestoneName}</span>
        <span className="font-medium">
          {formatNumber(currentKarma)} / {formatNumber(nextMilestone)}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {remaining > 0
          ? `${formatNumber(remaining)} karma to go!`
          : "Milestone reached!"}
      </p>
    </div>
  );
}
