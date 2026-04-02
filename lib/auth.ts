import Cookies from 'js-cookie';

export function getEntrepriseIdFromToken(): number | null {
  const token = Cookies.get('session_token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    return payload.entrepriseId || payload.id || null;
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return null;
  }
}

export function getUserNameFromToken(): string {
  const token = Cookies.get('session_token');
  if (!token) return "Admin";

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nom || "Admin";
  } catch {
    return "Admin";
  }
}

export function getUserIdFromToken(): string | null {
  const token = Cookies.get('session_token');
  if (!token) {
    console.warn("⚠️ Aucun token trouvé dans les cookies");
    return null;
  }

  try {
    // Utiliser la même méthode de décodage robuste que getEntrepriseIdFromToken()
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    console.log("📦 Payload du token:", payload);
    
    // Essayer plusieurs clés possibles pour l'ID utilisateur
    const userId = payload.userId || payload.idUser || payload.id || payload.sub || null;
    
    console.log("🔑 Clés trouvées:", Object.keys(payload));
    console.log("👤 ID utilisateur extrait:", userId);
    
    if (!userId) {
      console.error("❌ Impossible de trouver l'ID utilisateur. Clés disponibles:", Object.keys(payload));
      console.error("📋 Allez sur /debug-token pour voir le contenu complet du token");
    }
    
    return userId;
  } catch (error) {
    console.error("❌ Erreur lors de l'extraction de l'userId du token:", error);
    return null;
  }
}
export function getUserEmailFromToken(): string | null {
  const token = Cookies.get('session_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null; // Ton JSON montre que l'email est dans "sub"
  } catch (error) {
    return null;
  }
}
