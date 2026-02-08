"use client"; //Ce composant s’exécute dans le navigateur
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
import { login } from "@/app/actions/auth";
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

export function SigninForm() {
  const [state, action] = useActionState(login, null);

  return (
    <div className={styles.container}>
      <form action={action}>
        <Card>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>Sign In</CardTitle>
            <CardDescription>
              Enter your details to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.content}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="username or email"
                defaultValue={state?.values?.identifier ?? ""}
              />
              {state?.error && "identifier" in state.error && (<p className={styles.error}>{state.error.identifier}</p>)}
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
              {state?.error && "global" in state.error && (<p className={styles.error}>{state.error.global}</p>)}
            </div>
          </CardContent>
          <CardFooter className={styles.footer}>
            <Button type="submit" className={styles.button}>Sign In</Button>
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