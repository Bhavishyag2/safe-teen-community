import { verifyEmailSchema } from "@/lib/validators/auth";
import {
  successResponse,
  validateRequest,
} from "@/lib/utils/api";

export async function POST(request: Request) {
  const { data, error: validationError } = await validateRequest(
    request,
    verifyEmailSchema
  );

  if (validationError) {
    return validationError;
  }

  // Return mock success for UI development
  return successResponse({
    message: "Email verified successfully",
    requiresParentConsent: false,
  });
}
