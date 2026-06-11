import {
  successResponse,
  errorResponse,
} from "@/lib/utils/api";
import { getMockContentById, MOCK_CONTENT } from "@shared/mock";

// Get single content item
export async function GET(
  request: Request,
  { params }: { params: { section: string; id: string } }
) {
  const { id, section } = params;

  // Find content in mock data
  const content = getMockContentById(id);

  if (!content) {
    return errorResponse("NOT_FOUND", "Content not found", 404);
  }

  // Get related content from same section
  const sectionContent = MOCK_CONTENT[content.section] || [];
  const relatedContent = sectionContent
    .filter((c) => c.id !== id)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      excerpt: c.excerpt,
      section: c.section,
      type: c.type,
      likes_count: c.likes_count,
      comments_count: c.comments_count,
      author: {
        pseudo_name: "MockAuthor",
        avatar_id: "avatar_01",
      },
    }));

  return successResponse({
    ...content,
    author: {
      id: content.author_id,
      pseudo_name: "MockAuthor",
      avatar_id: "avatar_01",
      avatar_url: null,
      id_verified: true,
    },
    isLiked: false,
    isBookmarked: false,
    relatedContent,
  });
}

// Update content - mock success
export async function PUT(
  request: Request,
  { params }: { params: { section: string; id: string } }
) {
  const { id } = params;

  const content = getMockContentById(id);
  if (!content) {
    return errorResponse("NOT_FOUND", "Content not found", 404);
  }

  return successResponse({
    ...content,
    message: "Content updated successfully",
  });
}

// Delete content - mock success
export async function DELETE(
  request: Request,
  { params }: { params: { section: string; id: string } }
) {
  const { id } = params;

  const content = getMockContentById(id);
  if (!content) {
    return errorResponse("NOT_FOUND", "Content not found", 404);
  }

  return successResponse({ message: "Content deleted successfully" });
}
