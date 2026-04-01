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
      
      //console.log("🔍 Session check:", !!session, session?.user?.email);

      if (session) {
        try {
          //console.log("✅ Session trouvée:", session.user.email);
          
          // Récupérer l'entrepriseId du sessionStorage
          const entrepriseId = sessionStorage.getItem('enterprise_id');
          //console.log("🏢 Enterprise ID:", entrepriseId);

          const response = await fetch(`http://localhost:8080/api/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mail: session.user.email,
              name: session.user.user_metadata?.full_name || "Utilisateur",
              surname: session.user.user_metadata?.last_name || "Google",
              entrepriseId: entrepriseId,
            })
          });

          //console.log("🚀 API Response:", response.status);
          
          // Nettoyer après utilisation
          sessionStorage.removeItem('enterprise_id');
          
          router.push("/salarier");
        } catch (err) {
          console.error("Erreur API:", err);
          sessionStorage.removeItem('enterprise_id');
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
      <div className="text-center">
        <p className="text-lg font-semibold">Finalisation de la connexion...</p>
        <p className="text-sm text-gray-500">Veuillez patienter.</p>
      </div>
    </div>
  );
}