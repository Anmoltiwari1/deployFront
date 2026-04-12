const BASE = "";

// ── Core request helper ───────────────────────────────────────────────────────
// Merges Content-Type with any extra headers (e.g. Authorization).
// Token is optional — public endpoints work without it.

async function request(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;

  const res = await fetch(`${BASE}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Auth header helper ────────────────────────────────────────────────────────
// Returns Authorization header only when token is present.
// Operations are public so token may be null for unauthenticated users.

const authHeader = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

// ── API ───────────────────────────────────────────────────────────────────────

export const api = {

  // Public — no token needed
  register: (username, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // Operations — public, but token is attached if user is logged in
  convert: (token, quantity, targetUnit) =>
    request("/api/convert", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ quantity, targetUnit }),
    }),

  add: (token, q1, q2, unit) =>
    request("/api/add", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ q1, q2, unit }),
    }),

  subtract: (token, q1, q2, unit) =>
    request("/api/subtract", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ q1, q2, unit }),
    }),

  divide: (token, q1, q2) =>
    request("/api/divide", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ q1, q2 }),
    }),

  compare: (token, q1, q2) =>
    request("/api/compare", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ q1, q2 }),
    }),

  // Protected — login required
  history: (token) =>
    request("/api/history", {
      method: "GET",
      headers: authHeader(token),
    }),
};