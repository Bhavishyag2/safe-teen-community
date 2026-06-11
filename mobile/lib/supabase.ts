// Mock Supabase implementation for UI development without backend

import type { User } from "@shared/types/database";
import { MOCK_CURRENT_USER } from "@shared/mock";

// Mock auth types to match Supabase structure
interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
  };
}

interface MockAuthResponse {
  data: {
    user: MockSession["user"] | null;
    session: MockSession | null;
  };
  error: Error | null;
}

// Create mock session
function createMockSession(): MockSession {
  return {
    access_token: "mock-access-token-" + Date.now(),
    refresh_token: "mock-refresh-token-" + Date.now(),
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: MOCK_CURRENT_USER.auth_id || "mock-auth-id",
      email: MOCK_CURRENT_USER.email,
      email_confirmed_at: MOCK_CURRENT_USER.email_verified
        ? new Date().toISOString()
        : null,
    },
  };
}

// Store mock session state
let mockSession: MockSession | null = null;

// Auth helpers - mock implementations
export async function signUp(
  email: string,
  password: string
): Promise<MockAuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockSession = createMockSession();
  return {
    data: {
      user: mockSession.user,
      session: mockSession,
    },
    error: null,
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<MockAuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockSession = createMockSession();
  return {
    data: {
      user: mockSession.user,
      session: mockSession,
    },
    error: null,
  };
}

export async function signOut(): Promise<{ error: Error | null }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  mockSession = null;
  return { error: null };
}

export async function getCurrentSession(): Promise<{
  session: MockSession | null;
  error: Error | null;
}> {
  // Return existing mock session or create one for dev mode
  if (!mockSession) {
    mockSession = createMockSession();
  }
  return { session: mockSession, error: null };
}

export async function getCurrentUser(): Promise<{
  user: MockSession["user"] | null;
  error: Error | null;
}> {
  if (!mockSession) {
    mockSession = createMockSession();
  }
  return { user: mockSession.user, error: null };
}

// Real-time subscription helpers - return no-op unsubscribe functions
export function subscribeToMessages(
  conversationId: string,
  callback: (payload: unknown) => void
) {
  // Return a mock channel object with unsubscribe method
  return {
    unsubscribe: () => {
      // No-op
    },
  };
}

export function subscribeToNotifications(
  userId: string,
  callback: (payload: unknown) => void
) {
  // Return a mock channel object with unsubscribe method
  return {
    unsubscribe: () => {
      // No-op
    },
  };
}

// Mock supabase client for compatibility
export const supabase = {
  auth: {
    signUp: async ({ email, password }: { email: string; password: string }) =>
      signUp(email, password),
    signInWithPassword: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => signIn(email, password),
    signOut: async () => signOut(),
    getSession: async () => {
      const { session, error } = await getCurrentSession();
      return { data: { session }, error };
    },
    getUser: async () => {
      const { user, error } = await getCurrentUser();
      return { data: { user }, error };
    },
    onAuthStateChange: (
      callback: (
        event: string,
        session: MockSession | null
      ) => void
    ) => {
      // Immediately call with mock session for dev mode
      setTimeout(() => {
        if (!mockSession) {
          mockSession = createMockSession();
        }
        callback("SIGNED_IN", mockSession);
      }, 100);

      // Return mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // No-op
            },
          },
        },
      };
    },
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: unknown) => ({
        single: async () => {
          // Return mock user for users table
          if (table === "users") {
            return { data: MOCK_CURRENT_USER, error: null };
          }
          return { data: null, error: null };
        },
        limit: (count: number) => ({
          data: [],
          error: null,
        }),
      }),
      single: async () => {
        if (table === "users") {
          return { data: MOCK_CURRENT_USER, error: null };
        }
        return { data: null, error: null };
      },
    }),
  }),
  channel: (name: string) => ({
    on: (
      event: string,
      filter: unknown,
      callback: (payload: unknown) => void
    ) => ({
      subscribe: () => ({
        unsubscribe: () => {
          // No-op
        },
      }),
    }),
  }),
};
