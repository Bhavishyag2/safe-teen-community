import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  receiverId: z.string().uuid().optional(),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
  contentType: z.enum(["text", "image", "file"]).default("text"),
  mediaUrl: z.string().url().optional(),
  replyToId: z.string().uuid().optional(),
}).refine(
  (data) => data.conversationId || data.receiverId,
  "Either conversationId or receiverId is required"
);

export const createGroupChatSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .max(100, "Group name is too long"),
  description: z.string().max(500).optional(),
  participantIds: z
    .array(z.string().uuid())
    .min(1, "At least 1 participant required")
    .max(50, "Maximum 50 participants"),
});

export const messageFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
  after: z.string().datetime().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateGroupChatInput = z.infer<typeof createGroupChatSchema>;
export type MessageFiltersInput = z.infer<typeof messageFiltersSchema>;
