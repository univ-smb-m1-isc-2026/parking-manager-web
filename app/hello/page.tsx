"use client";

import { useState } from "react";
import Link from "next/link";

export default function HelloPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/coucou");
      const text = await response.text();
      setMessage(text);
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'appel au backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <button
            onClick={callBackend}
            className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
            Appeler le backend
        </button>

        {loading && <p>Chargement...</p>}

        {message && (
            <p className="text-xl font-semibold text-green-600">
            {message}
            </p>
        )}
        </div>
    </main>
  );
}
