/**
 * Cliente de API centralizado para la comunicación con el backend FastAPI.
 * Maneja la persistencia del token JWT y la estructura de las peticiones.
 */

const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

let _token: string | null = null;

// Intentar recuperar token de localStorage al iniciar (opcional para persistencia)
if (typeof window !== "undefined") {
  _token = localStorage.getItem("imaginatio_token");
}

export function setToken(token: string) {
  _token = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("imaginatio_token", token);
  }
}

export function getToken(): string | null {
  return _token;
}

export function clearToken() {
  _token = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("imaginatio_token");
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error de red imprevisto" }));
    throw new Error(err.detail || `Error del servidor: ${res.status}`);
  }

  return res.json();
}

// ── Auth ──
export async function login(username: string) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
  setToken(data.token);
  return data;
}

// ── Minigames ──
export async function startMinigame(gameType: string) {
  return apiFetch("/minigame/start", {
    method: "POST",
    body: JSON.stringify({ game_type: gameType }),
  });
}

export async function endMinigame(sessionToken: string, payload: Record<string, any>) {
  return apiFetch("/minigame/end", {
    method: "POST",
    body: JSON.stringify({ session_token: sessionToken, ...payload }),
  });
}

export async function sunClick(sessionToken: string) {
  return apiFetch("/minigame/sun/click", {
    method: "POST",
    body: JSON.stringify({ session_token: sessionToken }),
  });
}

// ── User State ──
export async function fetchMyState() {
  return apiFetch("/users/me");
}

export async function fetchMyInventory() {
  return apiFetch("/users/me/inventory");
}

export async function fetchMyActivePlant() {
  return apiFetch("/users/me/active-plant");
}

export async function fastForwardBackendTime(hours: number) {
  return apiFetch("/users/me/debug/fast-forward", {
    method: "POST",
    body: JSON.stringify({ hours }),
  });
}
