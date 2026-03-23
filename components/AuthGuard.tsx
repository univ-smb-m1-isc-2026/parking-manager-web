'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = Cookies.get('session_token');
    
    const publicPaths = ['/signIn', '/signUp', '/'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!token && !isPublicPath) {
      router.replace('/signIn');
    } else if (token && isPublicPath) {
      router.replace('/employeur');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (!isAuthorized) {
    return null; // mettre un <LoadingSpinner /> ici
  }

  return <>{children}</>;
}