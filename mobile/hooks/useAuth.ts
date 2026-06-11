import { useEffect, useState, useCallback } from "react";
import type { User } from "@shared/types";
import { MOCK_CURRENT_USER } from "@shared/mock";

interface AuthState {
  user: { id: string; email: string } | null;
  profile: User | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  // Initialize with authenticated state for UI development
  const [state, setState] = useState<AuthState>({
    user: {
      id: MOCK_CURRENT_USER.auth_id || "mock-auth-id",
      email: MOCK_CURRENT_USER.email,
    },
    profile: MOCK_CURRENT_USER,
    session: { access_token: "mock-access-token" },
    isLoading: false,
    isAuthenticated: true,
  });

  // Simulate initial load (brief loading state for realistic UI)
  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate auth check delay
    const timer = setTimeout(() => {
      setState({
        user: {
          id: MOCK_CURRENT_USER.auth_id || "mock-auth-id",
          email: MOCK_CURRENT_USER.email,
        },
        profile: MOCK_CURRENT_USER,
        session: { access_token: "mock-access-token-" + Date.now() },
        isLoading: false,
        isAuthenticated: true,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Mock sign in
  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setState({
      user: {
        id: MOCK_CURRENT_USER.auth_id || "mock-auth-id",
        email: email,
      },
      profile: { ...MOCK_CURRENT_USER, email },
      session: { access_token: "mock-access-token-" + Date.now() },
      isLoading: false,
      isAuthenticated: true,
    });

    return { error: null };
  }, []);

  // Mock sign up
  const register = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setState({
      user: {
        id: "mock-new-user-" + Date.now(),
        email: email,
      },
      profile: {
        ...MOCK_CURRENT_USER,
        id: "mock-new-user-" + Date.now(),
        email,
        email_verified: false,
        status: "pending",
      },
      session: { access_token: "mock-access-token-" + Date.now() },
      isLoading: false,
      isAuthenticated: true,
    });

    return { error: null, requiresVerification: true };
  }, []);

  // Mock sign out
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In dev mode, we stay "authenticated" for UI testing
    // but you can uncomment below to actually log out:
    // setState({
    //   user: null,
    //   profile: null,
    //   session: null,
    //   isLoading: false,
    //   isAuthenticated: false,
    // });

    // For now, just reset loading state (stay authenticated)
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    // In mock mode, profile is always the same
    setState((prev) => ({
      ...prev,
      profile: MOCK_CURRENT_USER,
    }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshProfile,
  };
}
