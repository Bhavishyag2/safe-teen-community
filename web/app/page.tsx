"use client";

import * as React from "react";
import { MainLayout } from "@/components/layout";
import { SectionCard } from "@/components/sections";
import { PostCard } from "@/components/posts";
import { TrendingWidget } from "@/components/engagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTIONS, SECTION_ORDER } from "@shared/constants/sections";
import type { ContentSection, ContentType } from "@shared/types/database";

// Mock data for homepage
const mockRecentPosts = [
  {
    id: "1",
    title: "First day at new school - need advice!",
    body: "I just moved to a new city and tomorrow is my first day at a new school. I'm super nervous and don't know anyone. Has anyone been through this? Any tips on how to make friends quickly?",
    excerpt: "I just moved to a new city and tomorrow is my first day at a new school...",
    type: "forum_post" as ContentType,
    section: "school" as ContentSection,
    tags: ["advice", "new-school", "making-friends"],
    author: { pseudo_name: "NervousNewbie", avatar_url: null },
    is_anonymous: false,
    likes_count: 45,
    comments_count: 23,
    views_count: 156,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Budget-friendly skincare routine that actually works",
    body: "After months of trial and error, I finally found a skincare routine that works for my oily skin and doesn't break the bank. Here's what I use...",
    excerpt: "After months of trial and error, I finally found a skincare routine...",
    type: "article" as ContentType,
    section: "beauty_selfcare" as ContentSection,
    tags: ["skincare", "budget", "oily-skin"],
    author: { pseudo_name: "GlowGirl22", avatar_url: null },
    is_anonymous: false,
    likes_count: 128,
    comments_count: 45,
    views_count: 890,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "How do you deal with period cramps during exams?",
    body: "Exams are coming up and I always get terrible cramps. It's so hard to focus when you're in pain. What do you all do to manage this?",
    excerpt: "Exams are coming up and I always get terrible cramps...",
    type: "question" as ContentType,
    section: "period_health" as ContentSection,
    tags: ["cramps", "exams", "help"],
    author: null,
    is_anonymous: true,
    likes_count: 67,
    comments_count: 34,
    views_count: 234,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

const sectionStats: Record<ContentSection, { posts: number; active: number }> = {
  relationships: { posts: 1234, active: 24 },
  fashion: { posts: 856, active: 18 },
  health: { posts: 2341, active: 32 },
  school: { posts: 3456, active: 45 },
  career: { posts: 567, active: 12 },
  period_health: { posts: 1890, active: 28 },
  beauty_selfcare: { posts: 2234, active: 22 },
};

export default function HomePage() {
  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Welcome banner */}
        <Card className="mb-6 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Welcome to Teen Portal
                </h1>
                <p className="text-muted-foreground">
                  A safe space to learn, connect, and grow together
                </p>
              </div>
              <div className="hidden md:block text-4xl">✨</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Anonymous-friendly</Badge>
              <Badge variant="secondary">Moderated</Badge>
              <Badge variant="secondary">Supportive community</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            <Tabs defaultValue="sections" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sections">Explore Sections</TabsTrigger>
                <TabsTrigger value="feed">Recent Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="sections" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SECTION_ORDER.map((sectionId) => {
                    const section = SECTIONS[sectionId];
                    const stats = sectionStats[sectionId];
                    return (
                      <SectionCard
                        key={sectionId}
                        section={section}
                        postCount={stats.posts}
                        activeUsers={stats.active}
                      />
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="feed" className="mt-4 space-y-4">
                {mockRecentPosts.map((post) => (
                  <PostCard key={post.id} post={post} showSection />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TrendingWidget />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-medium">12,578</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium">45,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Online Now</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    181
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Post anonymously if you're not comfortable sharing your identity
                </p>
                <p>
                  Use tags to help others find your post
                </p>
                <p>
                  Be kind and supportive - we're all here to help each other
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
