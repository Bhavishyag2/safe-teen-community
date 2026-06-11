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
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoteButtons } from "@/components/engagement/VoteButtons";
import { UserProfileCard } from "@/components/user/UserProfileCard";
import { cn, formatTimeAgo } from "@/lib/utils";
import { SECTIONS } from "@shared/constants/sections";
import type { ContentSection, ContentType } from "@shared/types/database";

interface PostDetailProps {
  post: {
    id: string;
    title: string;
    body: string;
    type: ContentType;
    section: ContentSection;
    tags: string[];
    author: {
      id: string;
      pseudo_name: string;
      avatar_url?: string | null;
      created_at: string;
    } | null;
    is_anonymous: boolean;
    likes_count: number;
    comments_count: number;
    views_count: number;
    shares_count: number;
    cover_image_url?: string | null;
    created_at: string;
  };
}

const typeLabels: Record<ContentType, string> = {
  article: "Article",
  forum_post: "Discussion",
  question: "Question",
  poll: "Poll",
  quiz: "Quiz",
  resource: "Resource",
};

export function PostDetail({ post }: PostDetailProps) {
  const [saved, setSaved] = React.useState(false);
  const section = SECTIONS[post.section];
  const authorName = post.is_anonymous ? "Anonymous" : post.author?.pseudo_name || "Unknown";
  const authorInitials = authorName.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back navigation */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${post.section}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {section.name}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Badge
                variant="outline"
                style={{ borderColor: section.color, color: section.color }}
              >
                {section.name}
              </Badge>
              <Badge variant="secondary">{typeLabels[post.type]}</Badge>
              <span className="ml-auto flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views_count} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

            {/* Author info */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback>{authorInitials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{authorName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {formatTimeAgo(post.created_at)}
                </div>
              </div>
            </div>

            {/* Cover image */}
            {post.cover_image_url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
                <Image
                  src={post.cover_image_url}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Body content */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              {post.body.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="my-6" />

            {/* Engagement stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <VoteButtons count={post.likes_count} orientation="horizontal" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-5 w-5" />
                  <span>{post.comments_count} comments</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Award className="h-4 w-4" />
                  Award
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2", saved && "text-primary")}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
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
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Author card */}
          {!post.is_anonymous && post.author && (
            <UserProfileCard
              user={{
                id: post.author.id,
                pseudo_name: post.author.pseudo_name,
                avatar_url: post.author.avatar_url,
                created_at: post.author.created_at,
                karma: 156,
              }}
              compact
            />
          )}

          {/* Related posts placeholder */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Related Posts</h3>
              <div className="space-y-3 text-sm">
                <Link
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Similar topic discussion here...
                </Link>
                <Link
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Another related post...
                </Link>
                <Link
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  More about this topic...
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
