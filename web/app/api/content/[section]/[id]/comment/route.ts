import { NextRequest } from "next/server";
import { createCommentSchema } from "@/lib/validators/content";
import {
  successResponse,
  errorResponse,
  validateRequest,
  getPaginationParams,
  paginationMeta,
} from "@/lib/utils/api";
import { getMockContentById, MOCK_CURRENT_USER } from "@shared/mock";

// Get comments for content - return empty for mock
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string; id: string } }
) {
  const { id: contentId } = params;
  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = getPaginationParams(searchParams);

  // Verify content exists
  const content = getMockContentById(contentId);
  if (!content) {
    return errorResponse("NOT_FOUND", "Content not found", 404);
  }

  // Return empty comments list for mock
  return successResponse({
    items: [],
    meta: paginationMeta(0, page, limit),
  });
}

// Create comment - mock success
export async function POST(
  request: Request,
  { params }: { params: { section: string; id: string } }
) {
  const { id: contentId } = params;

  const { data, error: validationError } = await validateRequest(
    request,
    createCommentSchema
  );
  if (validationError) return validationError;

  // Verify content exists
  const content = getMockContentById(contentId);
  if (!content) {
    return errorResponse("NOT_FOUND", "Content not found", 404);
  }

  // Return mock created comment
  const mockComment = {
    id: "mock-comment-" + Date.now(),
    content_id: contentId,
    user_id: MOCK_CURRENT_USER.id,
    parent_id: data.parentId || null,
    thread_depth: data.parentId ? 1 : 0,
    text: data.text,
    status: "approved",
    moderated_by: null,
    moderated_at: null,
    likes_count: 0,
    replies_count: 0,
    is_author_reply: false,
    is_pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: {
      id: MOCK_CURRENT_USER.id,
      pseudo_name: MOCK_CURRENT_USER.pseudo_name,
      avatar_id: MOCK_CURRENT_USER.avatar_id,
      avatar_url: MOCK_CURRENT_USER.avatar_url,
    },
    isLiked: false,
    isPending: false,
  };

  return successResponse(mockComment, 201);
}
