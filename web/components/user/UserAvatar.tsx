"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    pseudo_name: string;
    avatar_url?: string | null;
  };
  size?: "sm" | "default" | "lg" | "xl";
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  default: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const onlineDotClasses = {
  sm: "h-2 w-2",
  default: "h-3 w-3",
  lg: "h-4 w-4",
  xl: "h-5 w-5",
};

const textSizes = {
  sm: "text-[10px]",
  default: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
};

export function UserAvatar({
  user,
  size = "default",
  showOnlineStatus = false,
  isOnline = false,
  className,
}: UserAvatarProps) {
  const initials = user.pseudo_name.slice(0, 2).toUpperCase();

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={user.avatar_url || undefined} alt={user.pseudo_name} />
        <AvatarFallback
          className={cn(
            "bg-gradient-to-br from-pink-400 to-purple-500 text-white",
            textSizes[size]
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showOnlineStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            onlineDotClasses[size],
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
}
