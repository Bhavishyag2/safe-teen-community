import { z } from "zod";
import {
  successResponse,
  validateRequest,
} from "@/lib/utils/api";
import { MOCK_CURRENT_USER } from "@shared/mock";

// Get current user profile
export async function GET() {
  // Return mock user with additional computed fields
  return successResponse({
    ...MOCK_CURRENT_USER,
    isVerified: MOCK_CURRENT_USER.email_verified && MOCK_CURRENT_USER.id_verified,
    isComplete:
      MOCK_CURRENT_USER.email_verified &&
      (MOCK_CURRENT_USER.age_group !== "13-15" || MOCK_CURRENT_USER.parent_consent),
  });
}

// Update current user profile
const updateProfileSchema = z.object({
  pseudoName: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatarId: z.string().max(100).optional(),
  preferences: z
    .object({
      notifications: z
        .object({
          push: z.boolean().optional(),
          email: z.boolean().optional(),
          messages: z.boolean().optional(),
          mentions: z.boolean().optional(),
        })
        .optional(),
      privacy: z
        .object({
          showOnlineStatus: z.boolean().optional(),
          allowMessages: z.enum(["everyone", "verified", "none"]).optional(),
        })
        .optional(),
      content: z
        .object({
          sections: z
            .array(
              z.enum([
                "relationships",
                "fashion",
                "health",
                "school",
                "career",
                "period_health",
                "beauty_selfcare",
              ])
            )
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function PUT(request: Request) {
  const { data, error: validationError } = await validateRequest(
    request,
    updateProfileSchema
  );
  if (validationError) return validationError;

  // Return mock updated user
  const updatedUser = {
    ...MOCK_CURRENT_USER,
    pseudo_name: data.pseudoName || MOCK_CURRENT_USER.pseudo_name,
    avatar_id: data.avatarId || MOCK_CURRENT_USER.avatar_id,
    preferences: data.preferences
      ? {
          notifications: {
            ...MOCK_CURRENT_USER.preferences.notifications,
            ...data.preferences.notifications,
          },
          privacy: {
            ...MOCK_CURRENT_USER.preferences.privacy,
            ...data.preferences.privacy,
          },
          content: {
            ...MOCK_CURRENT_USER.preferences.content,
            ...data.preferences.content,
          },
        }
      : MOCK_CURRENT_USER.preferences,
    updated_at: new Date().toISOString(),
  };

  return successResponse(updatedUser);
}
