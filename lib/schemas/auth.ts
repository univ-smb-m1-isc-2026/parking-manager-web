import { z } from "zod";

export const signInSchema = z.object({
  mail: z.string().min(1, "Email required"),
  password: z.string().min(1, "Password required"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Username required"),
  surname: z.string().min(1, "Surname required"),
  nomEntreprise: z.string().min(1, "Entreprise name required"),
  mail: z.email("Email required"),
  password: z.string().min(8, "The password must be 8 characters long"),
});

