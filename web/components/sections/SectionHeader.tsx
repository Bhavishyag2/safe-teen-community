"use client";

import * as React from "react";
import {
  Heart,
  Shirt,
  Activity,
  BookOpen,
  Briefcase,
  Droplet,
  Sparkles,
  Users,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import type { SectionConfig } from "@shared/constants/sections";
import type { ContentSection } from "@shared/types/database";

const sectionIcons: Record<ContentSection, React.ReactNode> = {
  relationships: <Heart className="h-8 w-8" />,
  fashion: <Shirt className="h-8 w-8" />,
  health: <Activity className="h-8 w-8" />,
  school: <BookOpen className="h-8 w-8" />,
  career: <Briefcase className="h-8 w-8" />,
  period_health: <Droplet className="h-8 w-8" />,
  beauty_selfcare: <Sparkles className="h-8 w-8" />,
};

interface SectionHeaderProps {
  section: SectionConfig;
  memberCount?: number;
  onlineCount?: number;
  isSubscribed?: boolean;
  onSubscribeToggle?: () => void;
}

export function SectionHeader({
  section,
  memberCount = 12500,
  onlineCount = 45,
  isSubscribed = false,
  onSubscribeToggle,
}: SectionHeaderProps) {
  const [subscribed, setSubscribed] = React.useState(isSubscribed);

  const handleSubscribeClick = () => {
    setSubscribed(!subscribed);
    onSubscribeToggle?.();
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg border bg-card"
      data-section={section.id}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${section.color} 0%, transparent 60%)`,
        }}
      />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Section icon */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shrink-0"
            style={{ backgroundColor: section.color }}
          >
            {sectionIcons[section.id]}
          </div>

          {/* Section info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{section.name}</h1>
              <Badge variant="outline" className="shrink-0">
                {section.subcategories.length} topics
              </Badge>
            </div>

            <p className="mt-1 text-muted-foreground">{section.description}</p>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatNumber(memberCount)}</span>
                <span className="text-muted-foreground">members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">{onlineCount}</span>
                <span className="text-muted-foreground">online</span>
              </div>
            </div>

            {/* Subcategories */}
            <div className="mt-3 flex flex-wrap gap-2">
              {section.subcategories.slice(0, 4).map((subcat) => (
                <Badge
                  key={subcat}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                >
                  {subcat}
                </Badge>
              ))}
              {section.subcategories.length > 4 && (
                <Badge variant="outline">
                  +{section.subcategories.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant={subscribed ? "outline" : "default"}
              onClick={handleSubscribeClick}
              style={
                !subscribed
                  ? { backgroundColor: section.color }
                  : undefined
              }
            >
              {subscribed ? "Subscribed" : "Join"}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              <BookMarked className="h-3 w-3 mr-1" />
              Rules
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
