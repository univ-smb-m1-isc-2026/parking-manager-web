import Cookies from 'js-cookie';

const API_BASE_URL = 'https://parking-manager-api.oups.net';
//const API_BASE_URL = 'http://localhost:8080';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get('session_token');

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      console.warn("Session expirée ou non autorisée");
      // Optionnel : Cookies.remove('session_token'); window.location.href = '/signIn';
    }

    return response;
  } catch (error) {
    console.error("Erreur réseau API:", error);
    throw error;
  }
}