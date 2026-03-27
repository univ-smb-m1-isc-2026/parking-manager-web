"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500">Erreur</h1>
        <p>{message || "Une erreur est survenue."}</p>
      </div>
    </div>
  );
}