"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        router.replace("/signInSalarier");
        return;
      }

      if (data.session) {
        console.log("User connecté :", data.session.user);

        router.replace("/salarier");
      } else {
        router.replace("/signInSalarier");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Connexion en cours...</p>
    </div>
  );
}