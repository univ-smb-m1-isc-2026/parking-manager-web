"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function SignInSalarier() {
  const searchParams = useSearchParams();
  const enterpriseId = searchParams.get('enterpriseId');

  const handleSocialLogin = async (provider: "google" | "github") => {
    // Stocker l'enterpriseId dans sessionStorage pour l'utiliser au callback
    if (enterpriseId) {
      sessionStorage.setItem('enterprise_id', enterpriseId);
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:3000/callback",
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-slate-50">
      <Card className="w-full max-w-md">
        
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-600">
            Connexion salarié
          </CardTitle>
          <CardDescription className="text-center">
            Connecte-toi avec ton compte professionnel
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          <Button
            onClick={() => handleSocialLogin("google")}
            className="w-full"
          >
            Continuer avec Google
          </Button>

          <Button
            onClick={() => handleSocialLogin("github")}
            variant="outline"
            className="w-full"
          >
            Continuer avec GitHub
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}