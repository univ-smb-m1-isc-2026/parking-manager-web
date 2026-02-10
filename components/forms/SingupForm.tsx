"use client";
import Link from "next/link";

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
import { signUp } from "@/app/actions/auth";
import { useActionState } from "react";

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
  error: "text-xs text-red-600"
};

export function SignupForm() {
  const [state, action] = useActionState(signUp, null);
  console.log("appel du form");
  return (
    <div className={styles.container}>
      <form action={action}>
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
                name="name"
                type="text"
                placeholder="name"
                defaultValue={state?.values?.name ?? ""}
              />
               {state?.error && "name" in state.error && (<p className={styles.error}>{state.error.name}</p>)}
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                name="surname"
                type="text"
                placeholder="surname"
                defaultValue={state?.values?.surname ?? ""}
              />
              {state?.error && "surname" in state.error && (<p className={styles.error}>{state.error.surname}</p>)}
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="nomEntreprise">Name entreprise</Label>
              <Input
                id="nomEntreprise"
                name="nomEntreprise"
                type="nomEntreprise"
                placeholder="Name enterprise"
                defaultValue={state?.values?.nomEntreprise ?? ""}
              />
              {state?.error && "nomEntreprise" in state.error && (<p className={styles.error}>{state.error.nomEntreprise}</p>)}
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="mail">Mail</Label>
              <Input
                id="mail"
                name="mail"
                type="email"
                placeholder="name@example.com"
              />
              {state?.error && "mail" in state.error && (<p className={styles.error}>{state.error.mail}</p>)}
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
              />
              {state?.error && "password" in state.error && (<p className={styles.error}>{state.error.password}</p>)}
            </div>

          </CardContent>
          <CardFooter className={styles.footer}>
            <Button type="submit" className={styles.button}>Sign Up</Button>
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