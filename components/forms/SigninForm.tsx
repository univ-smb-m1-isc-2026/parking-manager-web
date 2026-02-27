"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  error: "text-xs text-red-600",
};

export function SigninForm() {
  const router = useRouter();

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login-entreprise",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mail, password }),
        }
      );

      if (!response.ok) {
        setError("Identifiants incorrects");
        return;
      }

      const token = await response.text();

      // stockage côté client (compatible export statique)
      localStorage.setItem("session_token", token);

      router.push("/employeur");
    } catch (err) {
      setError("Impossible de contacter le serveur.");
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
                type="text"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="email"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </CardContent>

          <CardFooter className={styles.footer}>
            <Button type="submit" className={styles.button}>
              Sign In
            </Button>
          </CardFooter>
        </Card>

        <div className={styles.prompt}>
          Don't have an account?
          <Link className={styles.link} href="signUp">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}