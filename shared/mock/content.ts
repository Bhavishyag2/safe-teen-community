// Mock content data for UI development without backend

import type { Content, ContentSection } from "../types/database";

function createMockContent(
  id: string,
  section: ContentSection,
  title: string,
  body: string,
  type: Content["type"] = "article"
): Content {
  return {
    id,
    type,
    section,
    title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    body,
    excerpt: body.substring(0, 150) + "...",
    cover_image_url: null,
    author_id: "mock-user-001",
    is_anonymous: false,
    status: "approved",
    moderated_by: "mock-mod-001",
    moderated_at: "2024-03-01T10:00:00Z",
    rejection_reason: null,
    tags: [],
    subcategory: null,
    likes_count: Math.floor(Math.random() * 100),
    comments_count: Math.floor(Math.random() * 20),
    views_count: Math.floor(Math.random() * 500),
    shares_count: Math.floor(Math.random() * 10),
    bookmarks_count: Math.floor(Math.random() * 30),
    is_featured: false,
    is_pinned: false,
    is_expert_content: false,
    allow_comments: true,
    meta_description: null,
    meta_keywords: null,
    poll_data: null,
    quiz_data: null,
    published_at: "2024-03-01T12:00:00Z",
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T12:00:00Z",
  };
}

export const MOCK_CONTENT: Record<ContentSection, Content[]> = {
  relationships: [
    createMockContent(
      "rel-001",
      "relationships",
      "Understanding Healthy Friendships",
      "Friendships are an important part of growing up. A healthy friendship is built on trust, respect, and mutual support. In this article, we explore what makes a friendship healthy and how to recognize when a relationship might not be serving you well. Good friends lift each other up, celebrate successes, and provide comfort during difficult times. They respect boundaries and communicate openly. If you find yourself feeling drained or anxious around certain friends, it might be time to evaluate those relationships."
    ),
    createMockContent(
      "rel-002",
      "relationships",
      "Setting Boundaries with Family",
      "Learning to set boundaries with family members can be challenging, especially as a teenager. This guide will help you understand why boundaries are important and how to communicate your needs respectfully. Boundaries are not about pushing people away - they're about creating healthy relationships where everyone's needs are respected. Start by identifying what makes you uncomfortable, then practice expressing your limits calmly and clearly."
    ),
    createMockContent(
      "rel-003",
      "relationships",
      "Navigating First Relationships",
      "Your first romantic relationship can be exciting and confusing at the same time. This article covers the basics of healthy dating, communication, and knowing when something doesn't feel right. Remember that a good partner respects your boundaries, supports your goals, and makes you feel valued. Take things at your own pace and never feel pressured to do anything you're not comfortable with.",
      "article"
    ),
  ],

  health: [
    createMockContent(
      "health-001",
      "health",
      "Mental Health Matters: Taking Care of Your Mind",
      "Your mental health is just as important as your physical health. This article explores simple ways to take care of your mental wellbeing, from practicing mindfulness to knowing when to ask for help. It's normal to feel stressed, anxious, or sad sometimes. What matters is having healthy coping strategies and knowing that it's okay to reach out for support when you need it."
    ),
    createMockContent(
      "health-002",
      "health",
      "Sleep and Teen Health",
      "Did you know that teenagers need 8-10 hours of sleep each night? Sleep is crucial for physical growth, mental health, and academic performance. This guide covers tips for better sleep hygiene, including limiting screen time before bed, maintaining a consistent sleep schedule, and creating a relaxing bedtime routine."
    ),
    createMockContent(
      "health-003",
      "health",
      "Understanding Anxiety",
      "Anxiety is one of the most common mental health challenges among teenagers. Learn to recognize the signs of anxiety, understand the difference between normal worry and anxiety disorders, and discover coping strategies that can help. Remember, seeking help is a sign of strength, not weakness.",
      "article"
    ),
  ],

  school: [
    createMockContent(
      "school-001",
      "school",
      "Study Tips for Better Grades",
      "Struggling with studying? These proven techniques can help you learn more effectively and remember information longer. From the Pomodoro Technique to active recall, discover study methods that work for your learning style. The key is finding what works best for you and being consistent with your study habits."
    ),
    createMockContent(
      "school-002",
      "school",
      "Dealing with Academic Pressure",
      "Feeling overwhelmed by schoolwork, exams, and expectations? You're not alone. This article offers practical advice for managing academic stress while maintaining your wellbeing. Learn to prioritize tasks, break large projects into smaller steps, and give yourself grace when things don't go perfectly."
    ),
    createMockContent(
      "school-003",
      "school",
      "Making Friends at a New School",
      "Starting at a new school can be intimidating, but it's also an opportunity for a fresh start. Here are tips for meeting new people, joining activities, and building connections. Remember, everyone feels nervous sometimes, and most people are happy to make new friends if you approach them with kindness.",
      "forum_post"
    ),
  ],

  career: [
    createMockContent(
      "career-001",
      "career",
      "Exploring Career Options",
      "Not sure what you want to do after school? That's completely normal! This guide helps you explore different career paths, understand your interests and strengths, and start planning for your future. Take career assessments, talk to professionals in fields that interest you, and don't be afraid to try different things."
    ),
    createMockContent(
      "career-002",
      "career",
      "Building Your First Resume",
      "Even without work experience, you can create a strong resume. Learn how to highlight your skills, volunteer work, extracurricular activities, and achievements. A good resume tells your story and shows potential employers or colleges what makes you unique."
    ),
    createMockContent(
      "career-003",
      "career",
      "Part-Time Jobs for Teens",
      "Looking for your first job? Discover age-appropriate job opportunities, what employers look for, and how to ace your first interview. Part-time work can teach valuable skills like time management, communication, and responsibility while giving you spending money and work experience.",
      "resource"
    ),
  ],

  period_health: [
    createMockContent(
      "period-001",
      "period_health",
      "Understanding Your Menstrual Cycle",
      "Your menstrual cycle is a natural part of growing up. This comprehensive guide explains what happens during each phase of your cycle, what's normal, and when to talk to a doctor. Understanding your body helps you feel more in control and prepared."
    ),
    createMockContent(
      "period-002",
      "period_health",
      "Managing Period Pain",
      "Period cramps can range from mild to severe. Learn about different methods to manage menstrual pain, from heat therapy and gentle exercise to over-the-counter medications. If your pain is severe or interfering with daily activities, it's important to talk to a healthcare provider."
    ),
    createMockContent(
      "period-003",
      "period_health",
      "Period Products: Finding What Works for You",
      "From pads and tampons to menstrual cups and period underwear, there are many options for managing your period. This guide compares different products to help you find what's most comfortable and convenient for your lifestyle.",
      "article"
    ),
  ],

  beauty_selfcare: [
    createMockContent(
      "beauty-001",
      "beauty_selfcare",
      "Skincare Basics for Teens",
      "Taking care of your skin doesn't have to be complicated. Learn the basics of a simple skincare routine, how to identify your skin type, and what products actually work. Remember, everyone's skin is different, and what works for someone else might not work for you."
    ),
    createMockContent(
      "beauty-002",
      "beauty_selfcare",
      "Self-Care Ideas That Actually Help",
      "Self-care isn't just face masks and bubble baths (though those are nice too!). Discover meaningful self-care practices that can improve your mental and physical wellbeing. From journaling to spending time in nature, find activities that recharge your batteries."
    ),
    createMockContent(
      "beauty-003",
      "beauty_selfcare",
      "Body Positivity: Loving Yourself",
      "In a world full of filtered photos and unrealistic standards, learning to love your body can be challenging. This article explores body positivity, media literacy, and practical ways to build a healthier relationship with your body. You are more than your appearance.",
      "article"
    ),
  ],

  fashion: [
    createMockContent(
      "fashion-001",
      "fashion",
      "Building a Capsule Wardrobe",
      "A capsule wardrobe is a collection of essential clothing items that can be mixed and matched to create many outfits. Learn how to build a versatile wardrobe that reflects your personal style without breaking the bank. Quality over quantity is the key."
    ),
    createMockContent(
      "fashion-002",
      "fashion",
      "Thrifting Tips and Tricks",
      "Thrift shopping is not only budget-friendly but also sustainable. Discover the best strategies for finding great pieces at thrift stores, including when to shop, what to look for, and how to spot quality items. One person's donation could be your new favorite outfit!"
    ),
    createMockContent(
      "fashion-003",
      "fashion",
      "Expressing Yourself Through Style",
      "Fashion is a form of self-expression. Whether you prefer bold colors, minimalist looks, or something in between, your style is uniquely yours. This article encourages you to experiment with fashion and find what makes you feel confident and comfortable.",
      "forum_post"
    ),
  ],
};

// Helper to get all mock content as a flat array
export function getAllMockContent(): Content[] {
  return Object.values(MOCK_CONTENT).flat();
}

// Helper to get content by ID
export function getMockContentById(id: string): Content | undefined {
  return getAllMockContent().find((content) => content.id === id);
}
