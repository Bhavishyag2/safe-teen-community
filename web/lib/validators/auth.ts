import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
  pseudoName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date")
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const verifyIdSchema = z.object({
  method: z.enum(["idfy", "digilocker"]),
  idType: z.enum(["aadhaar", "pan", "student_id"]),
  idNumber: z.string().optional(),
  digilockerCode: z.string().optional(),
});

export const parentConsentSchema = z.object({
  parentEmail: z.string().email("Please enter a valid parent email address"),
  parentName: z.string().min(2, "Parent name is required").optional(),
});

export const verifyParentConsentSchema = z.object({
  token: z.string().uuid("Invalid consent token"),
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type VerifyIdInput = z.infer<typeof verifyIdSchema>;
export type ParentConsentInput = z.infer<typeof parentConsentSchema>;
export type VerifyParentConsentInput = z.infer<typeof verifyParentConsentSchema>;
