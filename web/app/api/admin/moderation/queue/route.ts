import { NextRequest } from "next/server";
import {
  successResponse,
  getPaginationParams,
  paginationMeta,
} from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = getPaginationParams(searchParams);

  // Return empty moderation queue for mock
  return successResponse({
    items: [],
    meta: paginationMeta(0, page, limit),
    stats: {
      pending: 0,
      inReview: 0,
      urgent: 0,
    },
  });
}
