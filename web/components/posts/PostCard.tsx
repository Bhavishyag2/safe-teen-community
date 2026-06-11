"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Flag,
  Eye,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { VoteButtons } from "@/components/engagement/VoteButtons";
import { cn, formatTimeAgo } from "@/lib/utils";
import { SECTIONS } from "@shared/constants/sections";
import type { Content, ContentSection, ContentType } from "@shared/types/database";

interface PostCardProps {
  post: {
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
  };
  variant?: "default" | "compact";
  showSection?: boolean;
}

const typeLabels: Record<ContentType, string> = {
  article: "Article",
  forum_post: "Discussion",
  question: "Question",
  poll: "Poll",
  quiz: "Quiz",
  resource: "Resource",
};

export function PostCard({
  post,
  variant = "default",
  showSection = true,
}: PostCardProps) {
  const [saved, setSaved] = React.useState(false);
  const section = SECTIONS[post.section];
  const authorName = post.is_anonymous ? "Anonymous" : post.author?.pseudo_name || "Unknown";
  const authorInitials = authorName.slice(0, 2).toUpperCase();

  const excerpt = post.excerpt || post.body.slice(0, 200);

  if (variant === "compact") {
    return (
      <Link href={`/${post.section}/${post.id}`}>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <VoteButtons
            count={post.likes_count}
            orientation="vertical"
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium line-clamp-1">{post.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{authorName}</span>
              <span>·</span>
              <span>{formatTimeAgo(post.created_at)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {post.comments_count}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Card className="post-card overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Vote column */}
          <div className="flex flex-col items-center py-3 px-2 bg-muted/30">
            <VoteButtons count={post.likes_count} orientation="vertical" />
          </div>

          {/* Main content */}
          <div className="flex-1 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              {showSection && (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: section.color, color: section.color }}
                  >
                    {section.name}
                  </Badge>
                  <span>·</span>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.author?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {authorName}
                </span>
              </div>
              <span>·</span>
              <span>{formatTimeAgo(post.created_at)}</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                {typeLabels[post.type]}
              </Badge>
            </div>

            {/* Title and content */}
            <Link href={`/${post.section}/${post.id}`} className="block group">
              <h2 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>

              <div className="flex gap-4 mt-2">
                {post.cover_image_url && (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden shrink-0 bg-muted">
                    <Image
                      src={post.cover_image_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {excerpt}
                </p>
              </div>
            </Link>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 mt-3 -ml-2">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5" asChild>
                <Link href={`/${post.section}/${post.id}#comments`}>
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments_count} Comments</span>
                </Link>
              </Button>

              <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                <Award className="h-4 w-4" />
                <span>Award</span>
              </Button>

              <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 gap-1.5", saved && "text-primary")}
                onClick={() => setSaved(!saved)}
              >
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                <span>{saved ? "Saved" : "Save"}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    {post.views_count} views
                  </DropdownMenuItem>
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
      </CardContent>
    </Card>
  );
}
