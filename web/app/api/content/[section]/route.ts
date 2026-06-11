import { NextRequest } from "next/server";
import { contentFiltersSchema } from "@/lib/validators/content";
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  paginationMeta,
} from "@/lib/utils/api";
import { MOCK_CONTENT } from "@shared/mock";
import type { ContentSection } from "@shared/types";

const VALID_SECTIONS: ContentSection[] = [
  "relationships",
  "fashion",
  "health",
  "school",
  "career",
  "period_health",
  "beauty_selfcare",
];

// Get content by section
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  const section = params.section as ContentSection;

  if (!VALID_SECTIONS.includes(section)) {
    return errorResponse("INVALID_SECTION", "Invalid content section", 400);
  }

  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = getPaginationParams(searchParams);

  // Get mock content for this section
  const sectionContent = MOCK_CONTENT[section] || [];

  // Parse filters (still validate even if we don't use all of them)
  const filters = contentFiltersSchema.parse({
    section,
    type: searchParams.get("type") || undefined,
    tags: searchParams.get("tags")?.split(",") || undefined,
    isFeatured: searchParams.get("featured") === "true" || undefined,
    isExpertContent: searchParams.get("expert") === "true" || undefined,
    search: searchParams.get("search") || undefined,
    page,
    limit,
    sortBy: searchParams.get("sortBy") || "created_at",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  });

  // Apply basic filtering to mock data
  let filteredContent = [...sectionContent];

  if (filters.type) {
    filteredContent = filteredContent.filter((c) => c.type === filters.type);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredContent = filteredContent.filter(
      (c) =>
        c.title.toLowerCase().includes(searchLower) ||
        c.body.toLowerCase().includes(searchLower)
    );
  }

  // Add mock isLiked and isBookmarked
  const enrichedContent = filteredContent.map((item) => ({
    ...item,
    isLiked: Math.random() > 0.7, // Random for demo
    isBookmarked: Math.random() > 0.8,
    author: {
      id: item.author_id,
      pseudo_name: "MockAuthor",
      avatar_id: "avatar_01",
      avatar_url: null,
    },
  }));

  // Paginate
  const start = (page - 1) * limit;
  const paginatedContent = enrichedContent.slice(start, start + limit);

  return successResponse({
    items: paginatedContent,
    meta: paginationMeta(enrichedContent.length, page, limit),
  });
}

// Create new content - mock success
export async function POST(
  request: Request,
  { params }: { params: { section: string } }
) {
  const section = params.section as ContentSection;

  if (!VALID_SECTIONS.includes(section)) {
    return errorResponse("INVALID_SECTION", "Invalid content section", 400);
  }

  // Return mock created content
  return successResponse(
    {
      id: "mock-content-" + Date.now(),
      section,
      status: "pending",
      message: "Content created and pending moderation",
    },
    201
  );
}
