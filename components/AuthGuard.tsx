"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { createClient } from "@/lib/client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkAuth = async () => {
      // Ignorer la vérification pour /callback
      if (pathname === "/callback") {
        setLoading(false);
        setIsAuthorized(true);  // ← IMPORTANT: autoriser le callback!
        return;
      }

      const token = Cookies.get('session_token');

      // 🔥 IMPORTANT : attendre supabase
      const { data: { session } } = await supabase.auth.getSession();

      const isAuthenticated = !!token || !!session;

      const publicPaths = [
        '/signIn',
        '/signUp',
        '/',
        '/signInSalarier',
        '/callback'
      ];
      const isPublicPath = publicPaths.includes(pathname);

      if (!isAuthenticated && !isPublicPath) {
        router.replace('/signIn');
      } 
      else if (isAuthenticated && isPublicPath) {
        if (token) {
          router.replace('/employeur');
        } else {
          router.replace('/salarier');
        }
      } 
      else {
        setIsAuthorized(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
    <div className="flex h-screen items-center justify-center">
      <p>Chargement...</p>
    </div>
    ); // mettre un <LoadingSpinner /> ici
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}