"use client";

import * as React from "react";
import Link from "next/link";
import {
  Heart,
  Shirt,
  Activity,
  BookOpen,
  Briefcase,
  Droplet,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SectionConfig } from "@shared/constants/sections";
import type { ContentSection } from "@shared/types/database";

const sectionIcons: Record<ContentSection, React.ReactNode> = {
  relationships: <Heart className="h-6 w-6" />,
  fashion: <Shirt className="h-6 w-6" />,
  health: <Activity className="h-6 w-6" />,
  school: <BookOpen className="h-6 w-6" />,
  career: <Briefcase className="h-6 w-6" />,
  period_health: <Droplet className="h-6 w-6" />,
  beauty_selfcare: <Sparkles className="h-6 w-6" />,
};

interface SectionCardProps {
  section: SectionConfig;
  postCount?: number;
  activeUsers?: number;
  className?: string;
}

export function SectionCard({
  section,
  postCount = 0,
  activeUsers = 0,
  className,
}: SectionCardProps) {
  return (
    <Link href={`/${section.id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
          className
        )}
      >
        {/* Gradient accent */}
        <div
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${section.color} 0%, transparent 60%)`,
          }}
        />

        {/* Color bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: section.color }}
        />

        <CardContent className="relative pt-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg text-white shrink-0"
              style={{ backgroundColor: section.color }}
            >
              {sectionIcons[section.id]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {section.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {section.description}
              </p>
            </div>
          </div>

          {/* Subcategories preview */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {section.subcategories.slice(0, 3).map((subcat) => (
              <Badge
                key={subcat}
                variant="secondary"
                className="text-xs"
              >
                {subcat}
              </Badge>
            ))}
            {section.subcategories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{section.subcategories.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="relative flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4">
            <span>{postCount} posts</span>
            {activeUsers > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {activeUsers} online
              </span>
            )}
          </div>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </CardFooter>
      </Card>
    </Link>
  );
}
