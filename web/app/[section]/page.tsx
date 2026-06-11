"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { SectionHeader } from "@/components/sections";
import { PostList, PostFilters, QuickPostComposer } from "@/components/posts";
import { TrendingWidget, EngagementPrompts } from "@/components/engagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECTIONS, getSectionById } from "@shared/constants/sections";
import type { ContentSection, ContentType } from "@shared/types/database";

// Mock posts data
const generateMockPosts = (section: ContentSection) => [
  {
    id: "1",
    title: `${SECTIONS[section].name} discussion topic - looking for advice`,
    body: "This is a sample post body text that would contain the actual content of the discussion. It can be quite long and detailed, explaining the situation or question in full.",
    excerpt: "This is a sample post body text that would contain...",
    type: "forum_post" as ContentType,
    section,
    tags: ["advice", "discussion"],
    author: { pseudo_name: "HelpfulUser123", avatar_url: null },
    is_anonymous: false,
    likes_count: 42,
    comments_count: 15,
    views_count: 234,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "How do you handle this common situation?",
    body: "I've been dealing with something and wanted to get your opinions. Has anyone else experienced this? What did you do?",
    excerpt: "I've been dealing with something and wanted to get your opinions...",
    type: "question" as ContentType,
    section,
    tags: ["question", "help-needed"],
    author: null,
    is_anonymous: true,
    likes_count: 89,
    comments_count: 34,
    views_count: 567,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "My experience and what I learned",
    body: "I wanted to share what happened to me and the lessons I took away from it. Maybe it can help someone else going through the same thing.",
    excerpt: "I wanted to share what happened to me and the lessons I took away...",
    type: "article" as ContentType,
    section,
    tags: ["experience", "story", "lessons"],
    author: { pseudo_name: "WiseGirl22", avatar_url: null },
    is_anonymous: false,
    likes_count: 156,
    comments_count: 45,
    views_count: 890,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Quick poll: What's your preference?",
    body: "Curious to know what everyone thinks about this. Vote and share your thoughts!",
    excerpt: "Curious to know what everyone thinks about this...",
    type: "poll" as ContentType,
    section,
    tags: ["poll", "opinions"],
    author: { pseudo_name: "CuriousMind", avatar_url: null },
    is_anonymous: false,
    likes_count: 67,
    comments_count: 23,
    views_count: 345,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Tips and tricks I wish I knew earlier",
    body: "After years of learning the hard way, here are some things I wish someone had told me. Hope this helps!",
    excerpt: "After years of learning the hard way, here are some things...",
    type: "article" as ContentType,
    section,
    tags: ["tips", "guide", "helpful"],
    author: { pseudo_name: "ExperiencedOne", avatar_url: null },
    is_anonymous: false,
    likes_count: 234,
    comments_count: 67,
    views_count: 1234,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

type SortOption = "hot" | "new" | "top" | "rising";
type ViewOption = "card" | "compact" | "list";
type TopPeriod = "today" | "week" | "month" | "year" | "all";

export default function SectionPage() {
  const params = useParams();
  const sectionId = params.section as string;

  // Validate section
  const section = getSectionById(sectionId);
  if (!section) {
    notFound();
  }

  const [sort, setSort] = React.useState<SortOption>("hot");
  const [topPeriod, setTopPeriod] = React.useState<TopPeriod>("today");
  const [view, setView] = React.useState<ViewOption>("card");
  const [postType, setPostType] = React.useState<ContentType | "all">("all");

  const posts = generateMockPosts(sectionId as ContentSection);

  const popularTags = [
    "advice",
    "tips",
    "question",
    "help",
    "discussion",
    "story",
    "experience",
    "guide",
  ];

  const sectionRules = [
    "Be respectful and supportive",
    "No bullying or harassment",
    "Keep content appropriate",
    "Use content warnings when needed",
    "Report concerning content",
  ];

  return (
    <MainLayout>
      <div
        className="p-4 md:p-6 max-w-7xl mx-auto"
        data-section={sectionId}
      >
        {/* Section header */}
        <SectionHeader
          section={section}
          memberCount={12500}
          onlineCount={45}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-6">
          {/* Main content */}
          <div className="space-y-4">
            {/* Quick post composer */}
            <QuickPostComposer section={sectionId as ContentSection} />

            {/* Filters */}
            <PostFilters
              sort={sort}
              topPeriod={topPeriod}
              view={view}
              postType={postType}
              tags={popularTags}
              onSortChange={(newSort, period) => {
                setSort(newSort);
                if (period) setTopPeriod(period);
              }}
              onViewChange={setView}
              onPostTypeChange={setPostType}
            />

            {/* Posts */}
            {posts.length > 0 ? (
              <PostList
                posts={posts}
                variant={view === "compact" ? "compact" : "default" as "default" | "compact"}
                showSection={false}
              />
            ) : (
              <EngagementPrompts
                type="empty_section"
                sectionName={section.name}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* About section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  About {section.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{section.description}</p>

                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {section.subcategories.map((subcat) => (
                      <Badge key={subcat} variant="secondary" className="text-xs">
                        {subcat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Section Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  {sectionRules.map((rule, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-medium text-foreground">
                        {index + 1}.
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Trending in section */}
            <TrendingWidget />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
