// Auto-generated types from Supabase schema
// Run `supabase gen types typescript` to regenerate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types
export type UserStatus = "pending" | "active" | "suspended" | "banned";
export type AgeGroup = "13-15" | "16-18" | "19+";
export type UserRole = "user" | "moderator" | "admin";
export type ContentType =
  | "article"
  | "forum_post"
  | "question"
  | "poll"
  | "quiz"
  | "resource";
export type ContentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "archived";
export type ContentSection =
  | "relationships"
  | "fashion"
  | "health"
  | "school"
  | "career"
  | "period_health"
  | "beauty_selfcare";
export type CommentStatus = "pending" | "approved" | "rejected" | "hidden";
export type MessageStatus = "sent" | "delivered" | "read" | "flagged" | "deleted";
export type ModerationStatus = "pending" | "approved" | "flagged" | "blocked";
export type ConversationType = "direct" | "group";
export type QueueStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "escalated";
export type QueuePriority = "low" | "normal" | "high" | "urgent";
export type ReportReason =
  | "harassment"
  | "inappropriate_content"
  | "spam"
  | "misinformation"
  | "self_harm"
  | "violence"
  | "personal_info"
  | "underage_content"
  | "other";
export type NotificationType =
  | "like"
  | "comment"
  | "reply"
  | "mention"
  | "message"
  | "follow"
  | "content_approved"
  | "content_rejected"
  | "warning"
  | "system";
export type VerificationStatus = "pending" | "verified" | "failed" | "expired";
export type VerificationMethod =
  | "email_domain"
  | "idfy"
  | "digilocker"
  | "manual";
export type ChatMessageRole = "user" | "assistant" | "system";

// Database tables
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      content: {
        Row: Content;
        Insert: ContentInsert;
        Update: ContentUpdate;
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      conversations: {
        Row: Conversation;
        Insert: ConversationInsert;
        Update: ConversationUpdate;
      };
      conversation_participants: {
        Row: ConversationParticipant;
        Insert: ConversationParticipantInsert;
        Update: ConversationParticipantUpdate;
      };
      moderation_queue: {
        Row: ModerationQueueItem;
        Insert: ModerationQueueItemInsert;
        Update: ModerationQueueItemUpdate;
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: ReportUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: ChatSessionInsert;
        Update: ChatSessionUpdate;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: ChatMessageInsert;
        Update: ChatMessageUpdate;
      };
    };
  };
}

// User types
export interface User {
  id: string;
  auth_id: string | null;
  pseudo_name: string;
  avatar_id: string | null;
  avatar_url: string | null;
  email: string;
  email_verified: boolean;
  email_domain: string | null;
  id_verified: boolean;
  id_verification_provider: string | null;
  id_verified_at: string | null;
  age_group: AgeGroup | null;
  date_of_birth: string | null;
  parent_email: string | null;
  parent_consent: boolean;
  parent_consent_at: string | null;
  preferences: UserPreferences;
  role: UserRole;
  status: UserStatus;
  last_seen_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    messages: boolean;
    mentions: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowMessages: "everyone" | "verified" | "none";
  };
  content: {
    sections: ContentSection[];
  };
}

export type UserInsert = Omit<User, "id" | "created_at" | "updated_at">;
export type UserUpdate = Partial<UserInsert>;

// Public user profile (safe to expose)
export interface PublicUser {
  id: string;
  pseudo_name: string;
  avatar_id: string | null;
  avatar_url: string | null;
  id_verified: boolean;
  created_at: string;
}

// Content types
export interface Content {
  id: string;
  type: ContentType;
  section: ContentSection;
  title: string;
  slug: string | null;
  body: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  is_anonymous: boolean;
  status: ContentStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  rejection_reason: string | null;
  tags: string[];
  subcategory: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count: number;
  bookmarks_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  is_expert_content: boolean;
  allow_comments: boolean;
  meta_description: string | null;
  meta_keywords: string[] | null;
  poll_data: PollData | null;
  quiz_data: QuizData | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PollData {
  options: PollOption[];
  votes: Record<string, number>;
  endsAt?: string;
  allowMultiple?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  answers: Record<string, string>;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
}

export type ContentInsert = Omit<
  Content,
  "id" | "slug" | "created_at" | "updated_at"
>;
export type ContentUpdate = Partial<ContentInsert>;

// Comment types
export interface Comment {
  id: string;
  content_id: string;
  user_id: string;
  parent_id: string | null;
  thread_depth: number;
  text: string;
  status: CommentStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  likes_count: number;
  replies_count: number;
  is_author_reply: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type CommentInsert = Omit<Comment, "id" | "created_at" | "updated_at">;
export type CommentUpdate = Partial<CommentInsert>;

// Conversation types
export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  created_by: string | null;
  is_moderated: boolean;
  allow_media: boolean;
  last_message_at: string;
  last_message_preview: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export type ConversationInsert = Omit<
  Conversation,
  "id" | "created_at" | "updated_at"
>;
export type ConversationUpdate = Partial<ConversationInsert>;

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  is_admin: boolean;
  is_muted: boolean;
  is_blocked: boolean;
  last_read_at: string;
  unread_count: number;
  joined_at: string;
  left_at: string | null;
}

export type ConversationParticipantInsert = Omit<
  ConversationParticipant,
  "id" | "joined_at"
>;
export type ConversationParticipantUpdate = Partial<ConversationParticipantInsert>;

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  receiver_id: string | null;
  content: string;
  content_type: "text" | "image" | "file";
  media_url: string | null;
  reply_to_id: string | null;
  status: MessageStatus;
  moderation_status: ModerationStatus;
  ai_moderation_score: number | null;
  ai_moderation_flags: string[] | null;
  moderated_by: string | null;
  moderated_at: string | null;
  is_system_message: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageInsert = Omit<Message, "id" | "created_at" | "updated_at">;
export type MessageUpdate = Partial<MessageInsert>;

// Moderation types
export interface ModerationQueueItem {
  id: string;
  content_type: string;
  content_id: string;
  ai_score: number | null;
  ai_flags: string[] | null;
  ai_categories: Record<string, number> | null;
  ai_provider: string | null;
  priority: QueuePriority;
  status: QueueStatus;
  assigned_to: string | null;
  assigned_at: string | null;
  reviewed_at: string | null;
  decision: string | null;
  notes: string | null;
  rejection_reason: string | null;
  notify_user: boolean;
  reported_by: string | null;
  report_reason: ReportReason | null;
  report_details: string | null;
  created_at: string;
  updated_at: string;
}

export type ModerationQueueItemInsert = Omit<
  ModerationQueueItem,
  "id" | "created_at" | "updated_at"
>;
export type ModerationQueueItemUpdate = Partial<ModerationQueueItemInsert>;

// Report types
export interface Report {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reported_user_id: string | null;
  reason: ReportReason;
  details: string | null;
  evidence_urls: string[] | null;
  status: string;
  moderation_queue_id: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  action_taken: string | null;
  created_at: string;
}

export type ReportInsert = Omit<Report, "id" | "created_at">;
export type ReportUpdate = Partial<ReportInsert>;

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  related_content_type: string | null;
  related_content_id: string | null;
  related_user_id: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  push_sent: boolean;
  push_sent_at: string | null;
  push_token_used: string | null;
  metadata: Json;
  created_at: string;
}

export type NotificationInsert = Omit<Notification, "id" | "created_at">;
export type NotificationUpdate = Partial<NotificationInsert>;

// Chat types
export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  topic: ContentSection | null;
  is_active: boolean;
  ended_at: string | null;
  has_crisis_flag: boolean;
  crisis_escalated_at: string | null;
  crisis_handled_by: string | null;
  user_rating: number | null;
  user_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export type ChatSessionInsert = Omit<
  ChatSession,
  "id" | "created_at" | "updated_at"
>;
export type ChatSessionUpdate = Partial<ChatSessionInsert>;

export interface ChatMessage {
  id: string;
  session_id: string;
  role: ChatMessageRole;
  content: string;
  model_used: string | null;
  tokens_used: number | null;
  response_time_ms: number | null;
  was_filtered: boolean;
  original_content: string | null;
  safety_flags: string[] | null;
  created_at: string;
}

export type ChatMessageInsert = Omit<ChatMessage, "id" | "created_at">;
export type ChatMessageUpdate = Partial<ChatMessageInsert>;
