import { reportContentSchema } from "@/lib/validators/content";
import {
  successResponse,
  errorResponse,
  validateRequest,
} from "@/lib/utils/api";
import { getMockContentById } from "@shared/mock";

// Report content - mock implementation
export async function POST(
  request: Request,
  { params }: { params: { section: string; id: string } }
) {
  const { id: contentId } = params;

  const { data, error: validationError } = await validateRequest(
    request,
    reportContentSchema
  );
  if (validationError) return validationError;

  // Ensure contentId matches
  if (data.contentId !== contentId) {
    return errorResponse("MISMATCH", "Content ID mismatch", 400);
  }

  // Check if content exists in mock data
  const content = getMockContentById(contentId);
  if (!content) {
    return errorResponse("NOT_FOUND", "Content not found", 404);
  }

  // Return mock success
  return successResponse({
    message: "Report submitted. Our team will review it shortly.",
    reportId: "mock-report-" + Date.now(),
  });
}
