import { sendChatMessageSchema } from "@/lib/validators/chat";
import {
  successResponse,
  errorResponse,
  validateRequest,
  rateLimit,
} from "@/lib/utils/api";
import { MOCK_CURRENT_USER } from "@shared/mock";

// Hardcoded bot responses for different topics
const BOT_RESPONSES: Record<string, string[]> = {
  default: [
    "I'm here to help! Feel free to ask me anything about relationships, health, school, or any other topics you'd like to discuss.",
    "That's a great question! While I'm in demo mode, I can't provide personalized advice, but I'm here to listen and chat.",
    "Thanks for sharing that with me. Remember, it's always okay to talk to a trusted adult if you need support.",
  ],
  relationships: [
    "Relationships can be complex, but communication is key. It's important to express your feelings openly and honestly.",
    "Setting boundaries is an important part of any healthy relationship. It's okay to say no when something doesn't feel right.",
  ],
  health: [
    "Taking care of your mental and physical health is so important. Small daily habits can make a big difference!",
    "If you're feeling overwhelmed, remember that it's okay to take a break. Self-care isn't selfish.",
  ],
};

function getRandomResponse(topic?: string): string {
  const responses = topic && BOT_RESPONSES[topic] ? BOT_RESPONSES[topic] : BOT_RESPONSES.default;
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function POST(request: Request) {
  // Rate limit - 30 messages per minute per user
  const rateLimitResult = rateLimit(`chat:${MOCK_CURRENT_USER.id}`, 30, 60000);
  if (!rateLimitResult.allowed) {
    return errorResponse(
      "RATE_LIMITED",
      "You're chatting too fast! Take a breather and try again in a bit.",
      429
    );
  }

  const { data, error: validationError } = await validateRequest(
    request,
    sendChatMessageSchema
  );
  if (validationError) return validationError;

  const sessionId = data.sessionId || "mock-session-" + Date.now();

  // Create mock user message
  const userMessage = {
    id: "mock-user-msg-" + Date.now(),
    session_id: sessionId,
    role: "user",
    content: data.message,
    model_used: null,
    tokens_used: null,
    response_time_ms: null,
    was_filtered: false,
    original_content: null,
    safety_flags: null,
    created_at: new Date().toISOString(),
  };

  // Create mock assistant response
  const assistantMessage = {
    id: "mock-assistant-msg-" + Date.now(),
    session_id: sessionId,
    role: "assistant",
    content: getRandomResponse(data.topic),
    model_used: "mock-model",
    tokens_used: 50,
    response_time_ms: 200,
    was_filtered: false,
    original_content: null,
    safety_flags: null,
    created_at: new Date().toISOString(),
  };

  return successResponse({
    sessionId,
    userMessage,
    assistantMessage,
    hasCrisisFlag: false,
  });
}
