"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveUsersProps {
  count: number;
  sectionName?: string;
  className?: string;
}

export function ActiveUsers({ count, sectionName, className }: ActiveUsersProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center">
        {/* Animated dots representing users */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      </div>
      <span>
        <span className="font-medium text-foreground">{count}</span>
        {" users online"}
        {sectionName && <span> in {sectionName}</span>}
      </span>
    </div>
  );
}

interface ActiveUsersCompactProps {
  count: number;
  className?: string;
}

export function ActiveUsersCompact({ count, className }: ActiveUsersCompactProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-xs text-muted-foreground">{count} online</span>
    </div>
  );
}
