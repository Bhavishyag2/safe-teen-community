import { registerSchema } from "@/lib/validators/auth";
import {
  successResponse,
  validateRequest,
} from "@/lib/utils/api";
import { MOCK_CURRENT_USER } from "@shared/mock";

export async function POST(request: Request) {
  // Validate request body
  const { data, error: validationError } = await validateRequest(
    request,
    registerSchema
  );

  if (validationError) {
    return validationError;
  }

  const { dateOfBirth, pseudoName } = data;

  // Calculate age group from date of birth
  let ageGroup: "13-15" | "16-18" | "19+" | null = null;
  let requiresParentConsent = false;

  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age <= 15) {
      ageGroup = "13-15";
      requiresParentConsent = true;
    } else if (age <= 18) {
      ageGroup = "16-18";
    } else {
      ageGroup = "19+";
    }
  }

  // Return mock success with created user
  const mockCreatedUser = {
    ...MOCK_CURRENT_USER,
    id: "mock-user-" + Date.now(),
    pseudo_name: pseudoName || MOCK_CURRENT_USER.pseudo_name,
    age_group: ageGroup || MOCK_CURRENT_USER.age_group,
    email_verified: false,
    status: "pending" as const,
  };

  return successResponse(
    {
      user: mockCreatedUser,
      requiresParentConsent,
      requiresEmailVerification: true,
    },
    201
  );
}
