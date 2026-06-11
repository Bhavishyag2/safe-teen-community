import { z } from "zod";
import {
  successResponse,
  errorResponse,
  validateRequest,
} from "@/lib/utils/api";

const moderateSchema = z.object({
  decision: z.enum(["approve", "reject", "edit", "escalate"]),
  notes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(500).optional(),
  editedContent: z.string().optional(),
  notifyUser: z.boolean().default(true),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data, error: validationError } = await validateRequest(
    request,
    moderateSchema
  );
  if (validationError) return validationError;

  // Return mock success for UI development
  return successResponse({
    message: `Content ${data.decision}d successfully`,
  });
}

// Assign queue item to moderator
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Return mock success for UI development
  return successResponse({
    message: "Item assigned to you",
  });
}
