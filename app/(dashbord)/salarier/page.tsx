"use client"

import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/client";

export default function Home() {
    const router = useRouter();
    const supabase = createClient(); // Initialise le client

    async function handleLogout() {
        try {
            // 1. Déconnexion de Supabase (pour les salariés)
            // Cela nettoie le LocalStorage et les cookies gérés par Supabase
            await supabase.auth.signOut();

            // 2. Supprime ton cookie manuel (pour les employeurs)
            Cookies.remove("session_token");

            // 3. Redirection vers la page de choix de connexion
            // On utilise window.location.href pour forcer un rafraîchissement propre
            window.location.href = "/signIn"; 
            
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
            <h1 className="text-xl font-bold">Bienvenue sur votre dashboard salarié</h1>
            
            <div className="p-4 border-t border-slate-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400 hover:text-red-300 transition w-full px-2 py-2 rounded-lg hover:bg-slate-800"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Se déconnecter</span>
                </button>
            </div>
        </div>
    )
}