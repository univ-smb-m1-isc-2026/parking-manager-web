"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";=

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. On écoute les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          console.log("Connexion réussie :", session.user);
          router.replace("/salarier");
        } else if (event === "INITIAL_SESSION") {
            // Si la session est déjà là au chargement
            if (session) {
                router.replace("/salarier");
            }
        }
      }
    );

    // 2. Sécurité : si après 5 secondes rien ne se passe, on redirige vers le login
    const timeout = setTimeout(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) router.replace("/signInSalarier");
        });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, supabase]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold">Finalisation de la connexion...</p>
        <p className="text-sm text-gray-500">Veuillez patienter.</p>
      </div>
    </div>
  );
}