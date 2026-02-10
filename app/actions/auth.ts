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
  console.log("appel de signUp");
  const result = signUpSchema.safeParse({
    mail: formData.get("mail"),
    password: formData.get("password"),
    nomEntreprise: formData.get("nomEntreprise"),
    name: formData.get("name"),
    surname: formData.get("surname"),
  });

  //si le données entrée par l'utilisateur sont incorrect on les renvoient pour ne pas vider le formulaire
  if (!result.success) {
    return {
      error: result.error.flatten().fieldErrors,
      values: {
        name: formData.get("name")?.toString() ?? "",
        surname: formData.get("surname")?.toString() ?? "",
        nomEntreprise: formData.get("nomEntreprise")?.toString() ?? "",
      },
    };
  };

  try {
    const response = await fetch("http://localhost:8080/api/auth/register-entreprise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: { global: errorData.message || "Une erreur est survenue lors de l'inscription." },
        values: result.data,
      };
    }

  } catch (error) {
    return {
      error: { global: "Impossible de contacter le serveur." },
      values: result.data,
    };
  };
  
  redirect("/employeur");
  
}

