import { sendMessageSchema } from "@/lib/validators/messages";
import {
  successResponse,
  validateRequest,
} from "@/lib/utils/api";
import { MOCK_CURRENT_USER } from "@shared/mock";

export async function POST(request: Request) {
  const { data, error: validationError } = await validateRequest(
    request,
    sendMessageSchema
  );
  if (validationError) return validationError;

  // Return mock sent message
  const mockMessage = {
    id: "mock-message-" + Date.now(),
    conversation_id: data.conversationId || "mock-conversation-new",
    sender_id: MOCK_CURRENT_USER.id,
    receiver_id: data.receiverId || null,
    content: data.content,
    content_type: "text",
    media_url: null,
    reply_to_id: null,
    status: "sent",
    moderation_status: "approved",
    ai_moderation_score: null,
    ai_moderation_flags: null,
    moderated_by: null,
    moderated_at: null,
    is_system_message: false,
    is_deleted: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender: {
      id: MOCK_CURRENT_USER.id,
      pseudo_name: MOCK_CURRENT_USER.pseudo_name,
      avatar_id: MOCK_CURRENT_USER.avatar_id,
      avatar_url: MOCK_CURRENT_USER.avatar_url,
    },
  };

  return successResponse(mockMessage, 201);
}
