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

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register-entreprise",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            surname,
            nomEntreprise,
            mail,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Erreur lors de l'inscription.");
        return;
      }

      // Après inscription on redirige vers login
      router.push("/signIn");
    } catch (err) {
      setError("Impossible de contacter le serveur.");
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>

          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="name"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                type="text"
                placeholder="surname"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="nomEntreprise">Name entreprise</Label>
              <Input
                id="nomEntreprise"
                value={nomEntreprise}
                onChange={(e) => setNomEntreprise(e.target.value)}
                type="text"
                placeholder="Name enterprise"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="mail">Mail</Label>
              <Input
                id="mail"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                type="email"
                placeholder="name@example.com"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="password"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </CardContent>

          <CardFooter className={styles.footer}>
            <Button type="submit" className={styles.button}>
              Sign Up
            </Button>
          </CardFooter>
        </Card>

        <div className={styles.prompt}>
          Have an account?
          <Link className={styles.link} href="signIn">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}