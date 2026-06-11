"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Shirt,
  Activity,
  BookOpen,
  Briefcase,
  Droplet,
  Sparkles,
  TrendingUp,
  Bookmark,
  FileText,
  Users,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SECTIONS, SECTION_ORDER, type SectionConfig } from "@shared/constants/sections";
import type { ContentSection } from "@shared/types/database";

const sectionIcons: Record<ContentSection, React.ReactNode> = {
  relationships: <Heart className="h-4 w-4" />,
  fashion: <Shirt className="h-4 w-4" />,
  health: <Activity className="h-4 w-4" />,
  school: <BookOpen className="h-4 w-4" />,
  career: <Briefcase className="h-4 w-4" />,
  period_health: <Droplet className="h-4 w-4" />,
  beauty_selfcare: <Sparkles className="h-4 w-4" />,
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const currentSection = pathname?.split("/")[1];

  // Mock data for active users and trending
  const activeUsers: Record<string, number> = {
    relationships: 24,
    fashion: 18,
    health: 32,
    school: 45,
    career: 12,
    period_health: 28,
    beauty_selfcare: 22,
  };

  const trendingTopics = [
    { title: "First date tips", section: "relationships", count: 156 },
    { title: "Budget skincare routine", section: "beauty_selfcare", count: 89 },
    { title: "Exam stress management", section: "school", count: 234 },
    { title: "Period pain remedies", section: "period_health", count: 67 },
  ];

  if (!isOpen && !isMobile) return null;

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background",
        isMobile
          ? "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out"
          : "w-64 shrink-0",
        isMobile && !isOpen && "-translate-x-full"
      )}
    >
      {/* Mobile close button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 py-4">
        {/* Quick actions */}
        <div className="px-3 mb-4">
          <Link href="/create">
            <Button className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Sections */}
        <div className="px-3 mb-4">
          <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sections
          </h4>
          <nav className="space-y-1">
            {SECTION_ORDER.map((sectionId) => {
              const section = SECTIONS[sectionId];
              const isActive = currentSection === sectionId;
              const users = activeUsers[sectionId] || 0;

              return (
                <Link
                  key={sectionId}
                  href={`/${sectionId}`}
                  onClick={isMobile ? onClose : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  style={{
                    borderLeft: isActive ? `3px solid ${section.color}` : "3px solid transparent",
                  }}
                >
                  <span style={{ color: section.color }}>
                    {sectionIcons[sectionId]}
                  </span>
                  <span className="flex-1">{section.name}</span>
                  {users > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {users} online
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator className="my-4" />

        {/* Trending Topics */}
        <div className="px-3 mb-4">
          <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Trending
          </h4>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <Link
                key={index}
                href={`/${topic.section}?trending=${encodeURIComponent(topic.title)}`}
                onClick={isMobile ? onClose : undefined}
                className="flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <span className="font-medium line-clamp-1">{topic.title}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{ borderColor: SECTIONS[topic.section as ContentSection].color }}
                  >
                    {SECTIONS[topic.section as ContentSection].name}
                  </Badge>
                  <span>{topic.count} posts</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Quick links */}
        <div className="px-3">
          <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Links
          </h4>
          <nav className="space-y-1">
            <Link
              href="/saved"
              onClick={isMobile ? onClose : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Bookmark className="h-4 w-4" />
              Saved Posts
            </Link>
            <Link
              href="/my-posts"
              onClick={isMobile ? onClose : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <FileText className="h-4 w-4" />
              My Posts
            </Link>
          </nav>
        </div>
      </ScrollArea>

      {/* Footer - Active users */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {Object.values(activeUsers).reduce((a, b) => a + b, 0)} users online
          </span>
        </div>
      </div>
    </aside>
  );
}
