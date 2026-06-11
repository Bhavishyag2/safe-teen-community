"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Flame, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CommentItem } from "./CommentItem";
import { CommentComposer } from "./CommentComposer";
import { EngagementPrompts } from "@/components/engagement/EngagementPrompts";
import { cn } from "@/lib/utils";

interface Comment {
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
  parent_id: string | null;
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  opUserId?: string;
  className?: string;
}

type SortOption = "best" | "new" | "controversial";

export function CommentThread({
  comments,
  postId,
  opUserId,
  className,
}: CommentThreadProps) {
  const [sort, setSort] = React.useState<SortOption>("best");
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = React.useState<Set<string>>(
    new Set()
  );

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "best", label: "Best", icon: <Sparkles className="h-4 w-4" /> },
    { value: "new", label: "New", icon: <Clock className="h-4 w-4" /> },
    { value: "controversial", label: "Controversial", icon: <Flame className="h-4 w-4" /> },
  ];

  const sortedComments = React.useMemo(() => {
    // Get top-level comments only
    const topLevel = comments.filter((c) => !c.parent_id);

    // Sort based on option
    return [...topLevel].sort((a, b) => {
      switch (sort) {
        case "best":
          return b.likes_count - a.likes_count;
        case "new":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "controversial":
          // Simple heuristic: most replies relative to votes
          return (b.replies_count / (b.likes_count + 1)) - (a.replies_count / (a.likes_count + 1));
        default:
          return 0;
      }
    });
  }, [comments, sort]);

  const getReplies = (parentId: string): Comment[] => {
    return comments
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => b.likes_count - a.likes_count);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const replies = getReplies(comment.id);
    const hasReplies = replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const isReplying = replyingTo === comment.id;
    const maxDepth = 4;

    return (
      <div key={comment.id}>
        <CommentItem
          comment={comment}
          isOP={opUserId === comment.author.pseudo_name}
          depth={depth}
          onReply={() => setReplyingTo(isReplying ? null : comment.id)}
        />

        {/* Reply composer */}
        {isReplying && (
          <div className={cn("ml-11 mt-2 mb-4", depth > 0 && "ml-[4.25rem]")}>
            <CommentComposer
              postId={postId}
              parentId={comment.id}
              placeholder={`Reply to ${comment.author.pseudo_name}...`}
              onCancel={() => setReplyingTo(null)}
              onSubmit={() => setReplyingTo(null)}
              compact
            />
          </div>
        )}

        {/* Replies */}
        {hasReplies && depth < maxDepth && (
          <div className={cn("ml-6", depth > 0 && "ml-6")}>
            {!isExpanded ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground mb-2"
                onClick={() => toggleReplies(comment.id)}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground mb-2"
                  onClick={() => toggleReplies(comment.id)}
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide replies
                </Button>
                {replies.map((reply) => renderComment(reply, depth + 1))}
              </>
            )}
          </div>
        )}

        {/* "Show more replies" for deep threads */}
        {hasReplies && depth >= maxDepth && (
          <Button
            variant="link"
            size="sm"
            className="ml-11 text-xs"
            asChild
          >
            <a href={`#comment-${comment.id}`}>
              Continue this thread →
            </a>
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className={cn(className)} id="comments">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h3>
          <div className="flex items-center gap-1">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sort === option.value ? "secondary" : "ghost"}
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setSort(option.value)}
              >
                {option.icon}
                <span className="hidden sm:inline">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Main comment composer */}
        <CommentComposer
          postId={postId}
          placeholder="What are your thoughts?"
        />

        <Separator className="my-4" />

        {/* Comments list */}
        {sortedComments.length === 0 ? (
          <EngagementPrompts type="first_comment" />
        ) : (
          <div className="space-y-1">
            {sortedComments.map((comment) => renderComment(comment))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
