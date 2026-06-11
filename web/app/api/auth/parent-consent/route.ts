import {
  parentConsentSchema,
  verifyParentConsentSchema,
} from "@/lib/validators/auth";
import {
  successResponse,
  validateRequest,
} from "@/lib/utils/api";

// Request parental consent
export async function POST(request: Request) {
  const { data, error: validationError } = await validateRequest(
    request,
    parentConsentSchema
  );

  if (validationError) return validationError;

  // Return mock success for UI development
  return successResponse({
    message: "Consent request sent to parent",
    requestId: "mock-consent-request-" + Date.now(),
  });
}

// Verify parental consent (called by parent)
export async function PUT(request: Request) {
  const { data, error: validationError } = await validateRequest(
    request,
    verifyParentConsentSchema
  );

  if (validationError) return validationError;

  // Return mock success for UI development
  return successResponse({
    message: "Consent provided successfully. Your child can now use the app.",
  });
}
