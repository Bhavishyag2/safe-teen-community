"use client";

import * as React from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CommentComposerProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  compact?: boolean;
  onSubmit?: (text: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function CommentComposer({
  postId,
  parentId,
  placeholder = "Add a comment...",
  compact = false,
  onSubmit,
  onCancel,
  className,
}: CommentComposerProps) {
  const [text, setText] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(compact);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (compact && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [compact]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit?.(text);
      setText("");
      if (!compact) {
        setIsFocused(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-3">
        {!compact && (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="/avatars/default.png" />
            <AvatarFallback>SG</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          {!isFocused && !compact ? (
            <button
              onClick={() => setIsFocused(true)}
              className="w-full px-4 py-2.5 text-left text-muted-foreground bg-muted/50 rounded-full hover:bg-muted transition-colors text-sm"
            >
              {placeholder}
            </button>
          ) : (
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "resize-none",
                compact ? "min-h-[60px]" : "min-h-[80px]"
              )}
              onFocus={() => setIsFocused(true)}
            />
          )}
        </div>
      </div>

      {(isFocused || compact) && (
        <div className={cn("flex items-center justify-between", !compact && "ml-11")}>
          <p className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl</kbd>
            {" + "}
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd>
            {" to submit"}
          </p>
          <div className="flex items-center gap-2">
            {(onCancel || (!compact && isFocused)) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else {
                    setIsFocused(false);
                    setText("");
                  }
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              {compact ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
