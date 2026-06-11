"use client";

import * as React from "react";
import {
  Award,
  Star,
  Heart,
  Zap,
  Trophy,
  Target,
  Flame,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type BadgeType =
  | "first_post"
  | "helpful_answer"
  | "top_contributor"
  | "week_streak"
  | "karma_100"
  | "karma_500"
  | "karma_1000"
  | "active_5_sections"
  | "verified"
  | "rising_star";

interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const badges: Record<BadgeType, Badge> = {
  first_post: {
    type: "first_post",
    name: "First Post",
    description: "Published your first post",
    icon: <Star className="h-4 w-4" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  helpful_answer: {
    type: "helpful_answer",
    name: "Helpful Answer",
    description: "Your answer was marked as helpful",
    icon: <Heart className="h-4 w-4" />,
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
  top_contributor: {
    type: "top_contributor",
    name: "Top Contributor",
    description: "Among the top contributors this month",
    icon: <Trophy className="h-4 w-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  week_streak: {
    type: "week_streak",
    name: "Week Streak",
    description: "Active for 7 days in a row",
    icon: <Flame className="h-4 w-4" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  karma_100: {
    type: "karma_100",
    name: "100 Karma",
    description: "Reached 100 karma points",
    icon: <Zap className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  karma_500: {
    type: "karma_500",
    name: "500 Karma",
    description: "Reached 500 karma points",
    icon: <Zap className="h-4 w-4" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  karma_1000: {
    type: "karma_1000",
    name: "1K Karma",
    description: "Reached 1000 karma points",
    icon: <Zap className="h-4 w-4" />,
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
  },
  active_5_sections: {
    type: "active_5_sections",
    name: "Explorer",
    description: "Active in 5 different sections",
    icon: <Target className="h-4 w-4" />,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  verified: {
    type: "verified",
    name: "Verified",
    description: "Verified account",
    icon: <Award className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  rising_star: {
    type: "rising_star",
    name: "Rising Star",
    description: "Rapidly gaining karma",
    icon: <Star className="h-4 w-4" />,
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
  },
};

interface UserBadgesProps {
  badgeTypes: BadgeType[];
  size?: "sm" | "default" | "lg";
  max?: number;
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-5 w-5",
  default: "h-7 w-7",
  lg: "h-9 w-9",
};

const iconSizes = {
  sm: "h-3 w-3",
  default: "h-4 w-4",
  lg: "h-5 w-5",
};

export function UserBadges({
  badgeTypes,
  size = "default",
  max = 5,
  showTooltip = true,
  className,
}: UserBadgesProps) {
  const visibleBadges = badgeTypes.slice(0, max);
  const hiddenCount = badgeTypes.length - max;

  const BadgeIcon = ({ badge }: { badge: Badge }) => (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        sizeClasses[size],
        badge.bgColor,
        badge.color
      )}
    >
      {React.cloneElement(badge.icon as React.ReactElement, {
        className: iconSizes[size],
      })}
    </div>
  );

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {visibleBadges.map((type) => {
          const badge = badges[type];
          if (!badge) return null;

          if (showTooltip) {
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <button className="cursor-default">
                    <BadgeIcon badge={badge} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <BadgeIcon key={type} badge={badge} />;
        })}
        {hiddenCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium",
                  sizeClasses[size]
                )}
              >
                +{hiddenCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hiddenCount} more badges</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

interface BadgeDisplayProps {
  type: BadgeType;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function BadgeDisplay({
  type,
  size = "default",
  showLabel = true,
  className,
}: BadgeDisplayProps) {
  const badge = badges[type];
  if (!badge) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          sizeClasses[size],
          badge.bgColor,
          badge.color
        )}
      >
        {React.cloneElement(badge.icon as React.ReactElement, {
          className: iconSizes[size],
        })}
      </div>
      {showLabel && (
        <div>
          <p className="text-sm font-medium">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </div>
      )}
    </div>
  );
}
