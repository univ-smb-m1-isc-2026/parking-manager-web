'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { createClient } from '@/lib/client';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('session_token');

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const isAuthenticated = !!token || !!user;

      const publicPaths = ['/signIn', '/signUp', '/', '/signInSalarier'];
      const isPublicPath = publicPaths.includes(pathname);

      console.log("JWT:", !!token, "Supabase:", !!user);

      if (!isAuthenticated && !isPublicPath) {
        router.replace('/signIn');
      } else if (isAuthenticated && isPublicPath) {
        // 👇 différencier les deux types
        if (token) {
          router.replace('/employeur');
        } else {
          router.replace('/salarie'); // à créer
        }
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return <>{children}</>;
}