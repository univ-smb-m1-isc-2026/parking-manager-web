"use client";

import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

export default function DebugToken() {
  const [tokenPayload, setTokenPayload] = useState<any>(null);
  const [rawToken, setRawToken] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = Cookies.get('session_token');
    
    if (!token) {
      setError("❌ Aucun token trouvé dans les cookies !");
      return;
    }

    setRawToken(token);

    try {
      // Décodage robuste
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      setTokenPayload(payload);
    } catch (err) {
      setError(`❌ Erreur de décodage: ${err}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🔍 Debug Token</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {tokenPayload && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Payload du Token</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(tokenPayload, null, 2)}
              </pre>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">🔑 Clés Disponibles</h2>
              <div className="space-y-2">
                {Object.keys(tokenPayload).map((key) => (
                  <div key={key} className="bg-blue-50 p-3 rounded border border-blue-200">
                    <span className="font-mono font-bold text-blue-700">{key}</span>
                    <span className="text-gray-600">: </span>
                    <span className="text-gray-800">{JSON.stringify(tokenPayload[key])}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 p-4 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">💡 Comment utiliser cette info :</h3>
              <p className="text-yellow-800 text-sm">
                Trouvez le champ qui contient l'ID utilisateur (ex: <span className="font-mono bg-yellow-100">idUser</span>, 
                <span className="font-mono bg-yellow-100">userId</span>, <span className="font-mono bg-yellow-100">id</span>, etc.)
              </p>
              <p className="text-yellow-800 text-sm mt-2">
                Puis modifiez la fonction <span className="font-mono bg-yellow-100">getUserIdFromToken()</span> dans 
                <span className="font-mono bg-yellow-100"> lib/auth.ts</span> pour utiliser ce champ.
              </p>
            </div>
          </>
        )}

        {!error && !tokenPayload && (
          <div className="bg-blue-50 p-6 rounded border border-blue-300">
            <p className="text-blue-700">Chargement du token...</p>
          </div>
        )}

        <div className="mt-8">
          <a href="/signIn" className="text-blue-600 hover:underline">
            ← Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}
