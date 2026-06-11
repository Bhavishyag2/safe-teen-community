"use client";

import * as React from "react";
import { MessageSquare, Sparkles, Users, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PromptType = "first_comment" | "share_experience" | "join_discussion" | "empty_section";

interface EngagementPromptsProps {
  type: PromptType;
  sectionName?: string;
  discussionCount?: number;
  onAction?: () => void;
  className?: string;
}

const prompts: Record<PromptType, {
  icon: React.ReactNode;
  title: string;
  description: string | ((props: EngagementPromptsProps) => string);
  actionLabel: string;
}> = {
  first_comment: {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Be the first to comment!",
    description: "Start the conversation and help others feel welcome to share.",
    actionLabel: "Add a comment",
  },
  share_experience: {
    icon: <PenLine className="h-5 w-5" />,
    title: "Share your experience",
    description: "Your story could help someone going through the same thing.",
    actionLabel: "Share now",
  },
  join_discussion: {
    icon: <Users className="h-5 w-5" />,
    title: "Join the conversation",
    description: (props) =>
      `Join ${props.discussionCount || 24} others discussing this topic.`,
    actionLabel: "Join in",
  },
  empty_section: {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Be the first to share!",
    description: (props) =>
      `No posts in ${props.sectionName || "this section"} yet. Be a trailblazer!`,
    actionLabel: "Create post",
  },
};

export function EngagementPrompts({
  type,
  sectionName,
  discussionCount,
  onAction,
  className,
}: EngagementPromptsProps) {
  const prompt = prompts[type];
  const description =
    typeof prompt.description === "function"
      ? prompt.description({ type, sectionName, discussionCount, onAction })
      : prompt.description;

  return (
    <Card className={cn("bg-muted/50 border-dashed", className)}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          {prompt.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium">{prompt.title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={onAction}>
          {prompt.actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

interface AfterVotePromptProps {
  onComment?: () => void;
}

export function AfterVotePrompt({ onComment }: AfterVotePromptProps) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg text-sm animate-in slide-in-from-bottom-2">
      <span className="text-muted-foreground">
        Thanks for voting! Consider leaving a comment too
      </span>
      <Button variant="link" size="sm" className="h-auto p-0" onClick={onComment}>
        Add comment
      </Button>
    </div>
  );
}
