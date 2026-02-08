"use server";

import { signInSchema } from "@/lib/schemas/auth";
import { signUpSchema } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";

export async function login(_: any, formData: FormData) {
  const result = signInSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { 
      error: result.error.flatten().fieldErrors,
      values: {
        identifier: formData.get("identifier")?.toString() ?? "",
      }
    };
  }

  const { identifier, password } = result.data;

  // TODO: vrai appel API
  if (identifier === "admin" && password === "admin") {
    redirect("/employeur");
  } else if (identifier === "user" && password === "user"){
    redirect("/salarier");
  }

  return { 
    error: { 
      global: "Invalid password" 
    },
    values: {
      identifier,
    }, 
  };
}


export async function signUp(_: any, formData: FormData) {
  const result = signUpSchema.safeParse({
    identifier: formData.get("identifier"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      error: result.error.flatten().fieldErrors,
      values: {
        identifier: formData.get("identifier")?.toString() ?? "",
      },
    };
  }

  // TODO: appel API pour enregistrer l'utilisateur

  redirect("/employeur");
}

