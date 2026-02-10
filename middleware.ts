import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session_token")?.value;

  // --- 1. GESTION DE LA RACINE "/" ---
  // Si l'utilisateur arrive sur la racine, on l'envoie direct au login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/signIn", request.url));
  }

  // --- 2. GESTION DES UTILISATEURS DÉJÀ CONNECTÉS ---
  // Si on a un token et qu'on essaie d'aller sur Login ou Inscription -> Hop, au dashboard
  if (token && (pathname === "/signIn" || pathname === "/inscription")) {
    return NextResponse.redirect(new URL("/employeur", request.url));
  }

  // --- 3. PROTECTION DES ROUTES PRIVÉES ---
  // Liste des routes publiques (accessibles sans token)
  const publicPaths = ["/signIn", "/inscription"];
  
  // Est-ce que l'utilisateur est sur une route publique ?
  const isPublicPath = publicPaths.includes(pathname);

  // Si PAS de token ET qu'on n'est PAS sur une route publique -> Oust, au login
  if (!token && !isPublicPath) {
    // Note: On redirige vers /signIn, pas vers / pour éviter la boucle
    return NextResponse.redirect(new URL("/signIn", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};