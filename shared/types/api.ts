// API request and response types

import {
  User,
  PublicUser,
  Content,
  Comment,
  Message,
  Conversation,
  Notification,
  ChatSession,
  ChatMessage,
  ContentSection,
  ContentType,
  ReportReason,
  AgeGroup,
} from "./database";

// ============ Common Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============ Auth Types ============

export interface RegisterRequest {
  email: string;
  password: string;
  pseudoName?: string;
  dateOfBirth?: string;
}

export interface RegisterResponse {
  user: User;
  requiresParentConsent: boolean;
  requiresEmailVerification: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyIdRequest {
  method: "idfy" | "digilocker";
  idType: "aadhaar" | "pan" | "student_id";
  idNumber?: string; // For IDfy
  digilockerCode?: string; // For DigiLocker OAuth
}

export interface VerifyIdResponse {
  verified: boolean;
  message: string;
  ageGroup?: AgeGroup;
}

export interface ParentConsentRequest {
  parentEmail: string;
  parentName?: string;
}

export interface VerifyParentConsentRequest {
  token: string;
  code: string;
}

// ============ User Types ============

export interface UpdateProfileRequest {
  pseudoName?: string;
  avatarId?: string;
  preferences?: Partial<User["preferences"]>;
}

export interface UpdateAvatarRequest {
  avatarId: string;
  avatarUrl?: string;
}

export interface UserProfileResponse extends PublicUser {
  isVerified: boolean;
  joinedAt: string;
  contentCount: number;
}

// ============ Content Types ============

export interface CreateContentRequest {
  type: ContentType;
  section: ContentSection;
  title: string;
  body: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags?: string[];
  subcategory?: string;
  isAnonymous?: boolean;
  allowComments?: boolean;
  pollData?: {
    options: string[];
    endsAt?: string;
    allowMultiple?: boolean;
  };
  quizData?: {
    questions: Array<{
      text: string;
      options: string[];
      correctAnswer?: number;
      explanation?: string;
    }>;
  };
}

export interface UpdateContentRequest {
  title?: string;
  body?: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags?: string[];
  subcategory?: string;
  allowComments?: boolean;
}

export interface ContentFilters {
  section?: ContentSection;
  type?: ContentType;
  tags?: string[];
  authorId?: string;
  isFeatured?: boolean;
  isExpertContent?: boolean;
  search?: string;
}

export interface ContentListResponse {
  items: ContentWithAuthor[];
  meta: PaginationMeta;
}

export interface ContentWithAuthor extends Content {
  author: PublicUser | null;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface ContentDetailResponse extends ContentWithAuthor {
  relatedContent: ContentWithAuthor[];
}

export interface LikeContentRequest {
  contentId: string;
}

export interface BookmarkContentRequest {
  contentId: string;
}

// ============ Comment Types ============

export interface CreateCommentRequest {
  contentId: string;
  text: string;
  parentId?: string;
}

export interface CommentWithAuthor extends Comment {
  author: PublicUser;
  replies?: CommentWithAuthor[];
  isLiked?: boolean;
}

export interface CommentListResponse {
  items: CommentWithAuthor[];
  meta: PaginationMeta;
}

// ============ Forum Types ============

export interface CreateThreadRequest {
  section: ContentSection;
  title: string;
  body: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export interface CreateReplyRequest {
  threadId: string;
  text: string;
  parentId?: string;
}

export interface ThreadListResponse {
  items: ContentWithAuthor[];
  meta: PaginationMeta;
}

// ============ Message Types ============

export interface SendMessageRequest {
  conversationId?: string;
  receiverId?: string; // For new direct message
  content: string;
  contentType?: "text" | "image" | "file";
  mediaUrl?: string;
  replyToId?: string;
}

export interface CreateGroupChatRequest {
  name: string;
  description?: string;
  participantIds: string[];
}

export interface ConversationWithParticipants extends Conversation {
  participants: Array<{
    user: PublicUser;
    isAdmin: boolean;
    unreadCount: number;
  }>;
}

export interface ConversationListResponse {
  items: ConversationWithParticipants[];
  meta: PaginationMeta;
}

export interface MessageWithSender extends Message {
  sender: PublicUser | null;
  replyTo?: Message | null;
}

export interface MessageListResponse {
  items: MessageWithSender[];
  meta: PaginationMeta;
}

// ============ Chat (AI) Types ============

export interface SendChatMessageRequest {
  sessionId?: string; // Create new if not provided
  message: string;
  topic?: ContentSection;
}

export interface ChatMessageResponse {
  sessionId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  hasCrisisFlag?: boolean;
}

export interface ChatHistoryResponse {
  session: ChatSession;
  messages: ChatMessage[];
}

export interface ChatFeedbackRequest {
  sessionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
}

// ============ Report Types ============

export interface CreateReportRequest {
  contentType: string;
  contentId: string;
  reason: ReportReason;
  details?: string;
  evidenceUrls?: string[];
}

// ============ Notification Types ============

export interface NotificationListResponse {
  items: NotificationWithRelated[];
  meta: PaginationMeta;
  unreadCount: number;
}

export interface NotificationWithRelated extends Notification {
  relatedUser?: PublicUser;
}

export interface MarkNotificationsReadRequest {
  notificationIds?: string[]; // Mark specific, or all if empty
}

// ============ Admin/Moderation Types ============

export interface ModerationQueueFilters {
  status?: string;
  priority?: string;
  contentType?: string;
  assignedTo?: string;
}

export interface ModerationQueueResponse {
  items: ModerationQueueItemWithContent[];
  meta: PaginationMeta;
  stats: {
    pending: number;
    inReview: number;
    urgent: number;
  };
}

export interface ModerationQueueItemWithContent {
  id: string;
  contentType: string;
  contentId: string;
  content: unknown; // The actual content being moderated
  aiScore: number | null;
  aiFlags: string[] | null;
  priority: string;
  status: string;
  assignedTo: PublicUser | null;
  reportedBy: PublicUser | null;
  reportReason: string | null;
  createdAt: string;
}

export interface ModerateContentRequest {
  decision: "approve" | "reject" | "edit" | "escalate";
  notes?: string;
  rejectionReason?: string;
  editedContent?: string;
  notifyUser?: boolean;
}

export interface AdminStatsResponse {
  users: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  content: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  moderation: {
    queueSize: number;
    avgResponseTime: number;
    resolvedToday: number;
  };
  engagement: {
    dailyActiveUsers: number;
    postsToday: number;
    commentsToday: number;
  };
}
