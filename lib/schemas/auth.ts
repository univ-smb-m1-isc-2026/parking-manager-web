import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username required"),
  password: z.string().min(1, "Password required"),
});

export const signUpSchema = z.object({
  identifier: z.string().min(1, "Username required"),
  email: z.email("Email required"),
  password: z.string().min(8, "The password must be 8 characters long"),
});

