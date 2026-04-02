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
  title: "text-3xl font-bold text-blue-600",
  content: "space-y-4",
  fieldGroup: "space-y-2",
  footer: "flex flex-col",
  button: "w-full",
  prompt: "mt-4 text-center text-sm",
  link: "ml-2 text-blue-600",
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
        "https://parking-manager-api.oups.net/api/auth/register-entreprise",
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
            <CardTitle className={styles.title}>Inscrivez-vous</CardTitle>
            <CardDescription>
              Complétez les champs pour créer votre compte
            </CardDescription>
          </CardHeader>

          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="name">Prénom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Prénom"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="surname">Nom</Label>
              <Input
                id="surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                type="text"
                placeholder="Nom"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="nomEntreprise">Nom de votre entreprise</Label>
              <Input
                id="nomEntreprise"
                value={nomEntreprise}
                onChange={(e) => setNomEntreprise(e.target.value)}
                type="text"
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="mail">Email</Label>
              <Input
                id="mail"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                type="email"
                placeholder="nom@example.com"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Mot de passe"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </CardContent>

          <CardFooter className={styles.footer}>
            <Button type="submit" className={styles.button}>
              S'inscrire
            </Button>
          </CardFooter>
        </Card>

        <div className={styles.prompt}>
          Déjà un compte ?
          <Link className={styles.link} href="signIn">
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}