// API client for backend communication - Mock implementation for UI development

import { MOCK_CURRENT_USER, MOCK_CONTENT, getMockContentById } from "@shared/mock";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

// Mock API request that returns mock data based on endpoint
export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    // Route to appropriate mock handler
    const result = handleMockEndpoint(endpoint, options);
    return {
      data: result as T,
      error: null,
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Handle mock endpoints
function handleMockEndpoint(endpoint: string, options: ApiOptions): unknown {
  const method = options.method || "GET";

  // Auth endpoints
  if (endpoint === "/auth/register" && method === "POST") {
    return {
      user: { ...MOCK_CURRENT_USER, email_verified: false, status: "pending" },
      requiresParentConsent: false,
      requiresEmailVerification: true,
    };
  }

  if (endpoint === "/auth/login" && method === "POST") {
    return {
      user: MOCK_CURRENT_USER,
      accessToken: "mock-access-token-" + Date.now(),
      refreshToken: "mock-refresh-token-" + Date.now(),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  if (endpoint === "/auth/verify-email" && method === "POST") {
    return { message: "Email verified successfully", requiresParentConsent: false };
  }

  if (endpoint === "/auth/parent-consent" && method === "POST") {
    return { message: "Consent request sent to parent", requestId: "mock-consent-" + Date.now() };
  }

  // User endpoints
  if (endpoint === "/users/me" && method === "GET") {
    return {
      ...MOCK_CURRENT_USER,
      isVerified: MOCK_CURRENT_USER.email_verified && MOCK_CURRENT_USER.id_verified,
      isComplete: true,
    };
  }

  if (endpoint === "/users/me" && method === "PUT") {
    return { ...MOCK_CURRENT_USER, updated_at: new Date().toISOString() };
  }

  // Content endpoints
  const contentMatch = endpoint.match(/^\/content\/([^/]+)(?:\/([^/]+))?/);
  if (contentMatch) {
    const section = contentMatch[1];
    const id = contentMatch[2];

    if (id && method === "GET") {
      // Get single content
      const content = getMockContentById(id);
      if (content) {
        return {
          ...content,
          author: { id: content.author_id, pseudo_name: "MockAuthor", avatar_id: "avatar_01" },
          isLiked: false,
          isBookmarked: false,
          relatedContent: [],
        };
      }
      throw new Error("Content not found");
    }

    if (id && endpoint.endsWith("/like") && method === "POST") {
      return { liked: Math.random() > 0.5 };
    }

    if (id && endpoint.endsWith("/comment")) {
      if (method === "GET") {
        return { items: [], meta: { page: 1, limit: 20, total: 0, hasMore: false } };
      }
      if (method === "POST") {
        return {
          id: "mock-comment-" + Date.now(),
          text: (options.body as { text?: string })?.text || "",
          status: "approved",
          created_at: new Date().toISOString(),
        };
      }
    }

    // Get content list by section
    if (method === "GET" && !id) {
      const sectionContent = MOCK_CONTENT[section as keyof typeof MOCK_CONTENT] || [];
      return {
        items: sectionContent.map((item) => ({
          ...item,
          author: { id: item.author_id, pseudo_name: "MockAuthor", avatar_id: "avatar_01" },
          isLiked: false,
          isBookmarked: false,
        })),
        meta: { page: 1, limit: 20, total: sectionContent.length, hasMore: false },
      };
    }

    if (method === "POST") {
      return { id: "mock-content-" + Date.now(), status: "pending" };
    }
  }

  // Messages endpoints
  if (endpoint === "/messages/conversations" && method === "GET") {
    return { items: [], meta: { page: 1, limit: 20, total: 0, hasMore: false } };
  }

  if (endpoint === "/messages/send" && method === "POST") {
    return {
      id: "mock-message-" + Date.now(),
      content: (options.body as { content?: string })?.content || "",
      status: "sent",
      created_at: new Date().toISOString(),
    };
  }

  // Chat endpoints
  if (endpoint === "/chat/message" && method === "POST") {
    return {
      sessionId: "mock-session-" + Date.now(),
      userMessage: { id: "mock-user-msg", role: "user", content: (options.body as { message?: string })?.message },
      assistantMessage: {
        id: "mock-assistant-msg",
        role: "assistant",
        content: "I'm here to help! Feel free to ask me anything.",
      },
      hasCrisisFlag: false,
    };
  }

  if (endpoint.startsWith("/chat/history")) {
    return { items: [], meta: { page: 1, limit: 20, total: 0, hasMore: false } };
  }

  if (endpoint === "/chat/feedback" && method === "POST") {
    return { message: "Feedback submitted" };
  }

  // Notifications endpoints
  if (endpoint.startsWith("/notifications") && method === "GET") {
    return { items: [], meta: { page: 1, limit: 20, total: 0, hasMore: false } };
  }

  if (endpoint === "/notifications/read" && method === "POST") {
    return { message: "Notifications marked as read" };
  }

  // Default: return empty success
  return { message: "Success" };
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; pseudoName?: string; dateOfBirth?: string }) =>
    apiRequest("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    apiRequest("/auth/login", { method: "POST", body: data }),

  verifyEmail: (token: string) =>
    apiRequest("/auth/verify-email", { method: "POST", body: { token } }),

  requestParentConsent: (parentEmail: string) =>
    apiRequest("/auth/parent-consent", { method: "POST", body: { parentEmail } }),
};

// User API
export const userApi = {
  getProfile: () => apiRequest("/users/me"),

  updateProfile: (data: { pseudoName?: string; avatarId?: string; preferences?: unknown }) =>
    apiRequest("/users/me", { method: "PUT", body: data }),

  getPublicProfile: (pseudoName: string) => apiRequest(`/users/${pseudoName}`),
};

// Content API
export const contentApi = {
  getBySection: (section: string, params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiRequest(`/content/${section}${query}`);
  },

  getById: (section: string, id: string) =>
    apiRequest(`/content/${section}/${id}`),

  create: (section: string, data: unknown) =>
    apiRequest(`/content/${section}`, { method: "POST", body: data }),

  update: (section: string, id: string, data: unknown) =>
    apiRequest(`/content/${section}/${id}`, { method: "PUT", body: data }),

  like: (section: string, id: string) =>
    apiRequest(`/content/${section}/${id}/like`, { method: "POST" }),

  getComments: (section: string, id: string) =>
    apiRequest(`/content/${section}/${id}/comment`),

  addComment: (section: string, id: string, text: string, parentId?: string) =>
    apiRequest(`/content/${section}/${id}/comment`, {
      method: "POST",
      body: { contentId: id, text, parentId },
    }),

  report: (section: string, id: string, reason: string, details?: string) =>
    apiRequest(`/content/${section}/${id}/report`, {
      method: "POST",
      body: { contentType: "content", contentId: id, reason, details },
    }),
};

// Messages API
export const messagesApi = {
  getConversations: () => apiRequest("/messages/conversations"),

  sendMessage: (data: { conversationId?: string; receiverId?: string; content: string }) =>
    apiRequest("/messages/send", { method: "POST", body: data }),
};

// Chat API (AI chatbot)
export const chatApi = {
  sendMessage: (message: string, sessionId?: string, topic?: string) =>
    apiRequest("/chat/message", {
      method: "POST",
      body: { message, sessionId, topic },
    }),

  getHistory: (sessionId?: string) => {
    const query = sessionId ? `?sessionId=${sessionId}` : "";
    return apiRequest(`/chat/history${query}`);
  },

  sendFeedback: (sessionId: string, rating: number, feedback?: string) =>
    apiRequest("/chat/feedback", {
      method: "POST",
      body: { sessionId, rating, feedback },
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiRequest(`/notifications${query}`);
  },

  markRead: (notificationIds?: string[]) =>
    apiRequest("/notifications/read", {
      method: "POST",
      body: { notificationIds },
    }),
};
