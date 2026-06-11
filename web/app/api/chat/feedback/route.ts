import { chatFeedbackSchema } from "@/lib/validators/chat";
import {
  successResponse,
  validateRequest,
} from "@/lib/utils/api";

export async function POST(request: Request) {
  const { data, error: validationError } = await validateRequest(
    request,
    chatFeedbackSchema
  );
  if (validationError) return validationError;

  // Return mock success for UI development
  return successResponse({
    message: "Thanks for your feedback! It helps me get better at helping you.",
  });
}
