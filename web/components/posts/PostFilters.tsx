"use client";

import * as React from "react";
import {
  Flame,
  Clock,
  TrendingUp,
  Sparkles,
  LayoutGrid,
  List,
  AlignJustify,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ContentType } from "@shared/types/database";

type SortOption = "hot" | "new" | "top" | "rising";
type TopPeriod = "today" | "week" | "month" | "year" | "all";
type ViewOption = "card" | "compact" | "list";

interface PostFiltersProps {
  sort: SortOption;
  topPeriod?: TopPeriod;
  view: ViewOption;
  postType?: ContentType | "all";
  tags?: string[];
  selectedTags?: string[];
  onSortChange: (sort: SortOption, topPeriod?: TopPeriod) => void;
  onViewChange: (view: ViewOption) => void;
  onPostTypeChange?: (type: ContentType | "all") => void;
  onTagsChange?: (tags: string[]) => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "hot", label: "Hot", icon: <Flame className="h-4 w-4" /> },
  { value: "new", label: "New", icon: <Clock className="h-4 w-4" /> },
  { value: "top", label: "Top", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "rising", label: "Rising", icon: <Sparkles className="h-4 w-4" /> },
];

const viewOptions: { value: ViewOption; icon: React.ReactNode }[] = [
  { value: "card", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "compact", icon: <List className="h-4 w-4" /> },
  { value: "list", icon: <AlignJustify className="h-4 w-4" /> },
];

const postTypes: { value: ContentType | "all"; label: string }[] = [
  { value: "all", label: "All Posts" },
  { value: "forum_post", label: "Discussions" },
  { value: "question", label: "Questions" },
  { value: "poll", label: "Polls" },
  { value: "article", label: "Articles" },
];

export function PostFilters({
  sort,
  topPeriod = "today",
  view,
  postType = "all",
  tags = [],
  selectedTags = [],
  onSortChange,
  onViewChange,
  onPostTypeChange,
  onTagsChange,
}: PostFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-card rounded-lg border">
      {/* Sort options */}
      <div className="flex items-center gap-1 border-r pr-3 mr-1">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={sort === option.value ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => onSortChange(option.value)}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        ))}

        {/* Top period dropdown */}
        {sort === "top" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 ml-1">
                {topPeriod.charAt(0).toUpperCase() + topPeriod.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={topPeriod}
                onValueChange={(value) => onSortChange("top", value as TopPeriod)}
              >
                <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="week">This Week</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="month">This Month</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="year">This Year</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post type filter */}
      {onPostTypeChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">
                {postTypes.find((t) => t.value === postType)?.label || "All Posts"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Post Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {postTypes.map((type) => (
              <DropdownMenuItem
                key={type.value}
                onClick={() => onPostTypeChange(type.value)}
                className={cn(postType === type.value && "bg-muted")}
              >
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Tags filter pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 ml-2">
          {tags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags?.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (onTagsChange) {
                  if (selectedTags?.includes(tag)) {
                    onTagsChange(selectedTags.filter((t) => t !== tag));
                  } else {
                    onTagsChange([...(selectedTags || []), tag]);
                  }
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* View toggle - pushed to right */}
      <div className="flex items-center gap-1 ml-auto border-l pl-3">
        {viewOptions.map((option) => (
          <Button
            key={option.value}
            variant={view === option.value ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewChange(option.value)}
          >
            {option.icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
