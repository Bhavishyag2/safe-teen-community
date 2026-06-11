import { loginSchema } from "@/lib/validators/auth";
import {
  successResponse,
  errorResponse,
  validateRequest,
  rateLimit,
} from "@/lib/utils/api";
import { MOCK_CURRENT_USER } from "@shared/mock";

export async function POST(request: Request) {
  // Validate request body
  const { data, error: validationError } = await validateRequest(
    request,
    loginSchema
  );

  if (validationError) {
    return validationError;
  }

  const { email } = data;

  // Rate limiting - 5 attempts per minute per email
  const rateLimitResult = rateLimit(`login:${email}`, 5, 60000);
  if (!rateLimitResult.allowed) {
    return errorResponse(
      "RATE_LIMITED",
      "Too many login attempts. Please try again later.",
      429
    );
  }

  // Return mock user with fake tokens for UI development
  return successResponse({
    user: MOCK_CURRENT_USER,
    accessToken: "mock-access-token-" + Date.now(),
    refreshToken: "mock-refresh-token-" + Date.now(),
    expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  });
}
