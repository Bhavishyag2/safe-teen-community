import { z } from "zod";

const contentSections = [
  "relationships",
  "fashion",
  "health",
  "school",
  "career",
  "period_health",
  "beauty_selfcare",
] as const;

const contentTypes = [
  "article",
  "forum_post",
  "question",
  "poll",
  "quiz",
  "resource",
] as const;

export const createContentSchema = z.object({
  type: z.enum(contentTypes),
  section: z.enum(contentSections),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must be less than 255 characters"),
  body: z
    .string()
    .min(20, "Content must be at least 20 characters")
    .max(50000, "Content is too long"),
  excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
  coverImageUrl: z.string().url("Invalid image URL").optional(),
  tags: z.array(z.string().max(50)).max(10, "Maximum 10 tags allowed").optional(),
  subcategory: z.string().max(100).optional(),
  isAnonymous: z.boolean().optional().default(true),
  allowComments: z.boolean().optional().default(true),
  pollData: z
    .object({
      options: z
        .array(z.string().min(1).max(200))
        .min(2, "At least 2 options required")
        .max(10, "Maximum 10 options"),
      endsAt: z.string().datetime().optional(),
      allowMultiple: z.boolean().optional(),
    })
    .optional(),
  quizData: z
    .object({
      questions: z
        .array(
          z.object({
            text: z.string().min(5).max(500),
            options: z.array(z.string().min(1).max(200)).min(2).max(6),
            correctAnswer: z.number().min(0).optional(),
            explanation: z.string().max(500).optional(),
          })
        )
        .min(1, "At least 1 question required")
        .max(20, "Maximum 20 questions"),
    })
    .optional(),
});

export const updateContentSchema = createContentSchema.partial().omit({
  type: true,
  section: true,
});

export const contentFiltersSchema = z.object({
  section: z.enum(contentSections).optional(),
  type: z.enum(contentTypes).optional(),
  tags: z.array(z.string()).optional(),
  authorId: z.string().uuid().optional(),
  isFeatured: z.boolean().optional(),
  isExpertContent: z.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sortBy: z.enum(["created_at", "likes_count", "comments_count"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createCommentSchema = z.object({
  contentId: z.string().uuid("Invalid content ID"),
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long"),
  parentId: z.string().uuid().optional(),
});

export const reportContentSchema = z.object({
  contentType: z.string().min(1),
  contentId: z.string().uuid(),
  reason: z.enum([
    "harassment",
    "inappropriate_content",
    "spam",
    "misinformation",
    "self_harm",
    "violence",
    "personal_info",
    "underage_content",
    "other",
  ]),
  details: z.string().max(1000).optional(),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ContentFiltersInput = z.infer<typeof contentFiltersSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ReportContentInput = z.infer<typeof reportContentSchema>;
