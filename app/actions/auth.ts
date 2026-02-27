"use server";

import { signInSchema } from "@/lib/schemas/auth";
import { signUpSchema } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function login(_: any, formData: FormData) {
  const result = signInSchema.safeParse({
    mail: formData.get("mail"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { 
      error: result.error.flatten().fieldErrors,
      values: {
        mail: formData.get("mail")?.toString() ?? "",
      }
    };
  }

  const { mail, password } = result.data;

  try {
    const response = await fetch("http://localhost:8080/api/auth/login-entreprise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });

    // Gestion des erreurs (Souvent les erreurs Spring sont en JSON, même si le succès est en texte)
    if (!response.ok) {
      let errorMessage = "Identifiant incorrect";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si l'erreur n'est pas du JSON, on lit le texte brut
        errorMessage = await response.text(); 
      }
      
      return {
        error: { global: errorMessage },
        values: result.data,
      };
    }

    const token = await response.text(); 

    if (token) {
      const cookieStore = await cookies();
      
      // On stocke directement la chaîne reçue
      cookieStore.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      });
    } else {
        return {
            error: { global: "Erreur: Token vide reçu du serveur." },
            values: result.data,
        };
    }

  } catch (error) {
    console.error("Erreur login:", error);
    return {
      error: { global: "Impossible de contacter le serveur." },
      values: result.data,
    };
  };
  
  redirect("/employeur");
}


export async function signUp(_: any, formData: FormData) {
  const result = signUpSchema.safeParse({
    mail: formData.get("mail"),
    password: formData.get("password"),
    nomEntreprise: formData.get("nomEntreprise"),
    name: formData.get("name"),
    surname: formData.get("surname"),
  });

  //si le données entrée par l'utilisateur sont incorrect, on les renvoient pour ne pas vider le formulaire
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

export async function logout() {
  const cookieStore = await cookies();
  
  // Supprime le cookie
  cookieStore.delete("session_token");

  // Redirige vers la page d'accueil (Login)
  redirect("/signIn");
}