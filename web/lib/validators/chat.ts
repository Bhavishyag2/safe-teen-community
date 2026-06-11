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

export const sendChatMessageSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
  topic: z.enum(contentSections).optional(),
});

export const chatFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

export const chatHistorySchema = z.object({
  sessionId: z.string().uuid(),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type ChatFeedbackInput = z.infer<typeof chatFeedbackSchema>;
export type ChatHistoryInput = z.infer<typeof chatHistorySchema>;
