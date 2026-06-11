"use client";

import * as React from "react";
import {
  MessageSquare,
  MoreHorizontal,
  Flag,
  ChevronUp,
  ChevronDown,
  Award,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatTimeAgo } from "@/lib/utils";

interface CommentItemProps {
  comment: {
    id: string;
    text: string;
    author: {
      pseudo_name: string;
      avatar_url?: string | null;
    };
    is_author_reply: boolean;
    is_pinned: boolean;
    likes_count: number;
    replies_count: number;
    created_at: string;
  };
  isOP?: boolean;
  depth?: number;
  onReply?: () => void;
}

export function CommentItem({
  comment,
  isOP = false,
  depth = 0,
  onReply,
}: CommentItemProps) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  const [voteCount, setVoteCount] = React.useState(comment.likes_count);
  const [collapsed, setCollapsed] = React.useState(false);

  const handleVote = (direction: "up" | "down") => {
    if (vote === direction) {
      setVote(null);
      setVoteCount(comment.likes_count);
    } else {
      const diff = vote === null ? 1 : 2;
      setVote(direction);
      setVoteCount(
        direction === "up"
          ? comment.likes_count + diff
          : comment.likes_count - diff
      );
    }
  };

  const authorInitials = comment.author.pseudo_name.slice(0, 2).toUpperCase();

  if (collapsed) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <button
          onClick={() => setCollapsed(false)}
          className="hover:text-foreground"
        >
          [+]
        </button>
        <span className="font-medium">{comment.author.pseudo_name}</span>
        <span>· {comment.replies_count} replies</span>
      </div>
    );
  }

  return (
    <div className={cn("group", depth > 0 && "ml-6 pl-4 border-l-2 border-muted")}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.author.pseudo_name}
            </span>
            {isOP && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                OP
              </Badge>
            )}
            {comment.is_author_reply && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 text-blue-500 border-blue-500">
                Author
              </Badge>
            )}
            {comment.is_pinned && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 text-green-500 border-green-500">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              · {formatTimeAgo(comment.created_at)}
            </span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-xs text-muted-foreground hover:text-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            >
              [-]
            </button>
          </div>

          {/* Content */}
          <div className="mt-1 text-sm">{comment.text}</div>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2 -ml-2">
            {/* Votes */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full",
                  vote === "up" && "text-orange-500"
                )}
                onClick={() => handleVote("up")}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span
                className={cn(
                  "text-xs font-medium tabular-nums min-w-[1.5rem] text-center",
                  vote === "up" && "text-orange-500",
                  vote === "down" && "text-blue-500"
                )}
              >
                {voteCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full",
                  vote === "down" && "text-blue-500"
                )}
                onClick={() => handleVote("down")}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={onReply}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </Button>

            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Award className="h-3.5 w-3.5" />
              Award
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
