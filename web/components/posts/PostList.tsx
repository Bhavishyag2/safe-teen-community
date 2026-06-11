"use client";

import * as React from "react";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ContentSection, ContentType } from "@shared/types/database";

interface Post {
  id: string;
  title: string;
  body: string;
  excerpt?: string | null;
  type: ContentType;
  section: ContentSection;
  tags: string[];
  author: {
    pseudo_name: string;
    avatar_url?: string | null;
  } | null;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  cover_image_url?: string | null;
  created_at: string;
}

interface PostListProps {
  posts: Post[];
  variant?: "default" | "compact";
  showSection?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function PostList({
  posts,
  variant = "default",
  showSection = true,
  isLoading = false,
  emptyMessage = "No posts yet. Be the first to share!",
  className,
}: PostListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">✨</div>
        <h3 className="text-lg font-medium mb-2">No posts found</h3>
        <p className="text-muted-foreground max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          variant={variant}
          showSection={showSection}
        />
      ))}
    </div>
  );
}

function PostCardSkeleton({ variant }: { variant: "default" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="flex items-start gap-3 p-3">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex">
        <div className="flex flex-col items-center py-4 px-3 bg-muted/30">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-8 my-2" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
