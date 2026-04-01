"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

export default function AuthCallback() {
  const router = useRouter();
  const processed = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const handleAuth = async () => {
      if (processed.current) return;
      processed.current = true;

      // Vérifier immédiatement s'il y a une session
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log("🔍 Session check:", !!session, session?.user?.email);

      if (session) {
        try {
          console.log("✅ Session trouvée:", session.user.email);
          
          const response = await fetch(`http://localhost:8080/api/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mail: session.user.email,
              name: session.user.user_metadata?.full_name || "Utilisateur",
              surname: session.user.user_metadata?.last_name || "Google",
            })
          });

          console.log("🚀 API Response:", response.status);
          router.push("/salarier");
        } catch (err) {
          console.error("Erreur API:", err);
          router.push("/salarier");
        }
      } else {
        console.error("❌ Pas de session trouvée");
        router.push("/signIn");
      }
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Connexion en cours...</p>
    </div>
  );
}