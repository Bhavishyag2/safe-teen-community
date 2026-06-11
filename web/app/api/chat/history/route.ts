import { NextRequest } from "next/server";
import {
  successResponse,
  getPaginationParams,
  paginationMeta,
} from "@/lib/utils/api";

// Get chat sessions list - return empty for mock
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = getPaginationParams(searchParams);
  const sessionId = searchParams.get("sessionId");

  // If sessionId provided, return empty session with no messages
  if (sessionId) {
    return successResponse({
      session: {
        id: sessionId,
        user_id: "mock-user-001",
        title: null,
        topic: null,
        is_active: true,
        ended_at: null,
        has_crisis_flag: false,
        crisis_escalated_at: null,
        crisis_handled_by: null,
        user_rating: null,
        user_feedback: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      messages: [],
    });
  }

  // Return empty sessions list for mock
  return successResponse({
    items: [],
    meta: paginationMeta(0, page, limit),
  });
}
