import { successResponse, errorResponse } from "@/lib/utils/api";
import { getMockContentById } from "@shared/mock";

// Toggle like on content - mock implementation
export async function POST(
  request: Request,
  { params }: { params: { section: string; id: string } }
) {
  const { id: contentId } = params;

  // Verify content exists in mock data
  const content = getMockContentById(contentId);
  if (!content) {
    return errorResponse("NOT_FOUND", "Content not found", 404);
  }

  // Return toggled like state (random for demo)
  const liked = Math.random() > 0.5;
  return successResponse({ liked });
}
