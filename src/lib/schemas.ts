import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const signUpSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required").max(60),
  email: emailSchema,
  password: passwordSchema,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const watchlistNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(60, "Keep it under 60 characters");

export const symbolSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(1, "Symbol is required")
  .max(12, "Symbol looks too long")
  .regex(/^[A-Z0-9.\-]+$/, "Symbols use letters, numbers, dots and dashes only");
