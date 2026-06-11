import { NextRequest } from "next/server";
import {
  successResponse,
  getPaginationParams,
  paginationMeta,
} from "@/lib/utils/api";

// Get user's conversations - return empty for mock
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = getPaginationParams(searchParams);

  // Return empty conversations list for mock
  return successResponse({
    items: [],
    meta: paginationMeta(0, page, limit),
  });
}

// Create group chat - mock success
export async function POST() {
  return successResponse(
    {
      id: "mock-conversation-" + Date.now(),
      type: "group",
      message: "Group chat created successfully",
    },
    201
  );
}
