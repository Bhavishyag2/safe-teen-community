"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { PostDetail } from "@/components/posts";
import { CommentThread } from "@/components/comments";
import { EngagementPrompts } from "@/components/engagement";
import { getSectionById } from "@shared/constants/sections";
import type { ContentSection, ContentType } from "@shared/types/database";

// Mock post data
const getMockPost = (section: ContentSection, postId: string) => ({
  id: postId,
  title: "How do you deal with exam anxiety? Tips that actually work",
  body: `I've been struggling with exam anxiety for years, and I finally found some techniques that really help. I wanted to share them with you all in case they help someone else.

**1. Start preparing early**
Don't wait until the last minute. Cramming increases anxiety because you know you haven't properly learned the material.

**2. Practice with past papers**
This helps you get familiar with the format and reduces surprises on exam day.

**3. The 4-7-8 breathing technique**
Before the exam, breathe in for 4 seconds, hold for 7 seconds, and exhale for 8 seconds. This activates your parasympathetic nervous system and calms you down.

**4. Positive self-talk**
Replace "I'm going to fail" with "I've prepared and I'll do my best." It sounds cheesy but it really works!

**5. Take care of your body**
Get enough sleep, eat well, and exercise. Your brain works better when your body is healthy.

I hope this helps someone out there! What are your tips for dealing with exam anxiety?`,
  type: "forum_post" as ContentType,
  section,
  tags: ["exam-anxiety", "tips", "mental-health", "school"],
  author: {
    id: "user123",
    pseudo_name: "CalmMind22",
    avatar_url: null,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  is_anonymous: false,
  likes_count: 234,
  comments_count: 45,
  views_count: 1567,
  shares_count: 23,
  cover_image_url: null,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
});

// Mock comments data
const getMockComments = () => [
  {
    id: "c1",
    text: "This is so helpful! The breathing technique really works for me too. I also like to listen to calming music before exams.",
    author: { pseudo_name: "ZenStudent", avatar_url: null },
    is_author_reply: false,
    is_pinned: true,
    likes_count: 45,
    replies_count: 3,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "c1r1",
    text: "What kind of music do you listen to? I've been trying to find good study playlists.",
    author: { pseudo_name: "MusicLover", avatar_url: null },
    is_author_reply: false,
    is_pinned: false,
    likes_count: 12,
    replies_count: 1,
    created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    parent_id: "c1",
  },
  {
    id: "c1r2",
    text: "I usually go for lo-fi beats or classical music. Nothing with lyrics!",
    author: { pseudo_name: "ZenStudent", avatar_url: null },
    is_author_reply: false,
    is_pinned: false,
    likes_count: 8,
    replies_count: 0,
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    parent_id: "c1",
  },
  {
    id: "c2",
    text: "Thanks for sharing! I always struggle with positive self-talk. Any tips on how to actually believe it?",
    author: { pseudo_name: "WorkInProgress", avatar_url: null },
    is_author_reply: false,
    is_pinned: false,
    likes_count: 23,
    replies_count: 2,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "c2r1",
    text: "Great question! It takes practice. Start by noticing your negative thoughts, then consciously replace them. It feels fake at first but gets easier.",
    author: { pseudo_name: "CalmMind22", avatar_url: null },
    is_author_reply: true,
    is_pinned: false,
    likes_count: 34,
    replies_count: 0,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    parent_id: "c2",
  },
  {
    id: "c3",
    text: "The 4-7-8 breathing saved me in my last exam! I was panicking and it helped me calm down within minutes.",
    author: { pseudo_name: "AnxiousButTrying", avatar_url: null },
    is_author_reply: false,
    is_pinned: false,
    likes_count: 56,
    replies_count: 0,
    created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "c4",
    text: "I also find that arriving early to the exam room helps. It gives me time to settle in and not feel rushed.",
    author: { pseudo_name: "PreparedPanda", avatar_url: null },
    is_author_reply: false,
    is_pinned: false,
    likes_count: 18,
    replies_count: 0,
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
];

export default function PostPage() {
  const params = useParams();
  const sectionId = params.section as string;
  const postId = params.postId as string;

  // Validate section
  const section = getSectionById(sectionId);
  if (!section) {
    notFound();
  }

  const post = getMockPost(sectionId as ContentSection, postId);
  const comments = getMockComments();

  return (
    <MainLayout>
      <div
        className="p-4 md:p-6 max-w-4xl mx-auto"
        data-section={sectionId}
      >
        {/* Post content */}
        <PostDetail post={post} />

        {/* Engagement prompt */}
        <div className="my-6">
          <EngagementPrompts
            type="share_experience"
            onAction={() => {
              // Scroll to comment composer
              document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        {/* Comments */}
        <CommentThread
          comments={comments}
          postId={postId}
          opUserId="CalmMind22"
        />
      </div>
    </MainLayout>
  );
}
