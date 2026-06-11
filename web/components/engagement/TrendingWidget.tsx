"use client";

import * as React from "react";
import Link from "next/link";
import { TrendingUp, Flame, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SECTIONS } from "@shared/constants/sections";
import type { ContentSection } from "@shared/types/database";

interface TrendingPost {
  id: string;
  title: string;
  section: ContentSection;
  commentsCount: number;
  isHot?: boolean;
}

interface TrendingWidgetProps {
  posts?: TrendingPost[];
  className?: string;
}

const defaultTrendingPosts: TrendingPost[] = [
  {
    id: "1",
    title: "How to deal with exam anxiety - tips that actually work",
    section: "school",
    commentsCount: 156,
    isHot: true,
  },
  {
    id: "2",
    title: "Budget skincare routine for teens under ₹500",
    section: "beauty_selfcare",
    commentsCount: 89,
  },
  {
    id: "3",
    title: "First period at school - how I handled it",
    section: "period_health",
    commentsCount: 234,
    isHot: true,
  },
  {
    id: "4",
    title: "When your best friend becomes distant...",
    section: "relationships",
    commentsCount: 67,
  },
  {
    id: "5",
    title: "Career options after 12th - what I wish I knew",
    section: "career",
    commentsCount: 112,
  },
];

export function TrendingWidget({
  posts = defaultTrendingPosts,
  className,
}: TrendingWidgetProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.slice(0, 5).map((post, index) => {
          const section = SECTIONS[post.section];
          return (
            <Link
              key={post.id}
              href={`/${post.section}/${post.id}`}
              className="group flex gap-3"
            >
              <span className="text-lg font-bold text-muted-foreground shrink-0 w-5">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{ borderColor: section.color, color: section.color }}
                  >
                    {section.name}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {post.commentsCount}
                  </span>
                  {post.isHot && (
                    <span className="flex items-center gap-1 text-xs text-orange-500">
                      <Flame className="h-3 w-3" />
                      Hot
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
