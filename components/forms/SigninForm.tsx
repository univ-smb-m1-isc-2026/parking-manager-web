"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const styles = {
  container: "w-full max-w-md",
  header: "space-y-1",
  title: "text-3xl font-bold text-pink-500",
  content: "space-y-4",
  fieldGroup: "space-y-2",
  footer: "flex flex-col",
  button: "w-full",
  prompt: "mt-4 text-center text-sm",
  link: "ml-2 text-pink-500",
  error: "text-xs text-red-600 font-medium",
};

export function SigninForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const mail = formData.get("mail");
    const password = formData.get("password");

    try {
      const response = await fetch(
        //"http://localhost:8080/api/auth/login-entreprise",
        "https://parking-manager-api.oups.net/api/auth/login-entreprise",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mail, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Identifiants incorrects");
      }

      const token = await response.text();

      // Utilisation de js-cookie pour stocker le token
      Cookies.set("session_token", token, { 
        expires: 1, // Expire après 1 jour
        secure: window.location.protocol === "https:", // True si tu es en HTTPS
        sameSite: "strict", // Empêche l'envoi du cookie lors de requêtes cross-site
        path: "/" 
      });

      router.replace("/employeur");
      
    } catch (err: any) {
      setError(err.message || "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>Sign In</CardTitle>
            <CardDescription>
              Enter your details to sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="mail">Email</Label>
              <Input
                id="mail"
                name="mail"
                type="email" // Changé en email pour validation HTML5 native
                required
                placeholder="nom@entreprise.com"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className={styles.error}>{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className={styles.footer}>
            <Button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Connexion..." : "Sign In"}
            </Button>
          </CardFooter>
        </Card>

        <div className={styles.prompt}>
          Don't have an account?
          <Link className={styles.link} href="/signUp">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}