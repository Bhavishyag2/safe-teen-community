// API utility functions - Mock implementation for UI development

import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import type { User } from "@shared/types";
import {
  MOCK_CURRENT_USER,
  MOCK_MODERATOR_USER,
  MOCK_ADMIN_USER,
} from "@shared/mock";

// Standard API response helpers
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string>
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

export function validationError(error: ZodError) {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    details[path] = issue.message;
  }
  return errorResponse("VALIDATION_ERROR", "Invalid request data", 400, details);
}

// Request validation helper
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, error: validationError(error) };
    }
    return {
      data: null,
      error: errorResponse("INVALID_JSON", "Invalid JSON body", 400),
    };
  }
}

// Auth helper - returns mock user (no real authentication)
export async function getCurrentUser(): Promise<{
  user: User | null;
  error: NextResponse | null;
}> {
  // In dev mode, always return mock current user
  return { user: MOCK_CURRENT_USER, error: null };
}

// Check if user has required role - returns appropriate mock user
export async function requireRole(
  requiredRoles: Array<"user" | "moderator" | "admin">
): Promise<{ user: User; error: null } | { user: null; error: NextResponse }> {
  // Return a mock user with the first required role
  if (requiredRoles.includes("admin")) {
    return { user: MOCK_ADMIN_USER, error: null };
  }
  if (requiredRoles.includes("moderator")) {
    return { user: MOCK_MODERATOR_USER, error: null };
  }
  return { user: MOCK_CURRENT_USER, error: null };
}

// Check if user is active - returns mock user
export async function requireActiveUser(): Promise<
  { user: User; error: null } | { user: null; error: NextResponse }
> {
  // In dev mode, always return mock current user (who is active)
  return { user: MOCK_CURRENT_USER, error: null };
}

// Rate limiting helper (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    // New window
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

// Pagination helper
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}
