"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Cookies from "js-cookie";

export default function AuthCallback() {
  const router = useRouter();
  const processed = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const handleAuth = async () => {
      if (processed.current) return;
      processed.current = true;

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        try {
          const entrepriseId = sessionStorage.getItem('enterprise_id');

          const response = await fetch(`http://localhost:8080/api/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mail: session.user.email,
              name: session.user.user_metadata?.full_name || "Utilisateur",
              surname: session.user.user_metadata?.last_name || "Google",
              entrepriseId: entrepriseId ? parseInt(entrepriseId) : null,
            })
          });

          if (response.ok) {
            // ✅ IMPORTANT : On récupère le JSON { token: "...", idUser: ... }
            const data = await response.json();

            // ✅ On ne stocke QUE la chaîne du token dans le cookie
            // On retire les guillemets potentiels au cas où
            const pureToken = data.token.replace(/"/g, "");
            Cookies.set("session_token", pureToken, { expires: 1 });

            console.log("✅ Token récupéré sans fioritures");
          } else {
            console.error("❌ Erreur API Java:", response.status);
          }

          sessionStorage.removeItem('enterprise_id');
          router.push("/salarier");
        } catch (err) {
          console.error("Erreur:", err);
          router.push("/salarier");
        }
      } else {
        router.push("/signIn");
      }
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="text-lg font-semibold">Connexion à la base de données...</p>
      </div>
    </div>
  );
}