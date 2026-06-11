// AI Chatbot service using Claude API

import Anthropic from "@anthropic-ai/sdk";
import {
  CHATBOT_SYSTEM_PROMPT,
  detectCrisisKeywords,
  getCrisisResponse,
} from "@shared/constants/chatbot";
import type { ChatMessage, ContentSection } from "@shared/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 500;

interface ChatContext {
  sessionId: string;
  userId: string;
  topic?: ContentSection;
  previousMessages: ChatMessage[];
}

interface ChatResponse {
  content: string;
  hasCrisisFlag: boolean;
  crisisType?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  wasFiltered?: boolean;
  originalContent?: string;
  safetyFlags?: string[];
}

export async function generateChatResponse(
  userMessage: string,
  context: ChatContext
): Promise<ChatResponse> {
  const startTime = Date.now();

  // Check for crisis keywords first
  const crisisKeywords = detectCrisisKeywords(userMessage);
  if (crisisKeywords.length > 0) {
    const crisisResponse = getCrisisResponse(crisisKeywords);
    if (crisisResponse) {
      return {
        content: crisisResponse,
        hasCrisisFlag: true,
        crisisType: crisisKeywords[0],
        wasFiltered: false,
        safetyFlags: crisisKeywords,
        responseTimeMs: Date.now() - startTime,
      };
    }
  }

  // Build conversation history for context
  const conversationHistory = context.previousMessages
    .slice(-10) // Keep last 10 messages for context
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

  // Add topic context if available
  let systemPrompt = CHATBOT_SYSTEM_PROMPT;
  if (context.topic) {
    systemPrompt += `\n\nThe user is currently browsing the "${context.topic}" section. Keep responses relevant to this topic when appropriate.`;
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ],
    });

    const responseContent =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Check if the AI response contains any crisis indicators
    const responseCrisisKeywords = detectCrisisKeywords(responseContent);

    return {
      content: responseContent,
      hasCrisisFlag: responseCrisisKeywords.length > 0,
      crisisType:
        responseCrisisKeywords.length > 0 ? responseCrisisKeywords[0] : undefined,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      responseTimeMs: Date.now() - startTime,
      wasFiltered: false,
      safetyFlags: responseCrisisKeywords,
    };
  } catch (error) {
    console.error("Claude API error:", error);

    // Fallback response
    return {
      content:
        "I'm having a little trouble right now, but I'm still here for you! Can you try asking that again? 💜",
      hasCrisisFlag: false,
      responseTimeMs: Date.now() - startTime,
      wasFiltered: true,
      safetyFlags: ["api_error"],
    };
  }
}

// Generate a topic-specific greeting
export async function generateTopicGreeting(
  topic: ContentSection
): Promise<string> {
  const greetings: Record<ContentSection, string> = {
    relationships:
      "Hey! 💕 Want to chat about friendships, crushes, or anything relationship-related? I'm all ears!",
    fashion:
      "Ooh fashion talk! 👗 What's on your mind - outfit ideas, trends, or styling tips?",
    health:
      "Hi there! 🌟 Whether it's mental health, fitness, or just feeling good - I'm here to help!",
    school:
      "School stuff, huh? 📚 Exams, study tips, or dealing with school drama - let's figure it out together!",
    career:
      "Thinking about the future? ✨ College, careers, or just exploring what you might love - let's chat!",
    period_health:
      "Hey! 🌸 No topic is off-limits here. Questions about periods, puberty, or body stuff? I've got you!",
    beauty_selfcare:
      "Self-care time! 💆‍♀️ Skincare, confidence tips, or just feeling good about yourself - what's up?",
  };

  return greetings[topic] || "Hey! What would you like to chat about today? ✨";
}

// Summarize a chat session for feedback
export async function summarizeSession(
  messages: ChatMessage[]
): Promise<string> {
  if (messages.length < 3) {
    return "Short chat session";
  }

  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  // Simple keyword-based summary
  const topics = [];
  if (/friend|relationship|crush|dating/i.test(userMessages)) {
    topics.push("relationships");
  }
  if (/school|exam|study|homework/i.test(userMessages)) {
    topics.push("school");
  }
  if (/stress|anxi|depress|mental/i.test(userMessages)) {
    topics.push("mental health");
  }
  if (/period|puberty|body/i.test(userMessages)) {
    topics.push("health");
  }
  if (/career|college|future/i.test(userMessages)) {
    topics.push("career");
  }

  return topics.length > 0
    ? `Discussed: ${topics.join(", ")}`
    : "General conversation";
}
