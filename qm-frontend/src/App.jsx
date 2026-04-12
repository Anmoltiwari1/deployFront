import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));
  const [page, setPage]   = useState("dashboard");

  // ── Handle OAuth2 callback — GitHub redirects back with ?token=xxx ─────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      localStorage.setItem("jwt_token", t);
      setToken(t);
      window.history.replaceState({}, "", "/");
      setPage("history"); // after OAuth2 login, go straight to history
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = (t) => {
    setToken(t);
    setPage("history"); // after login, go straight to history
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    setPage("dashboard");
  };

  const handleHistoryClick = () => {
    if (!token) {
      setPage("login"); // not logged in → show login page
    } else {
      setPage("history");
    }
  };

  // ── Routing ───────────────────────────────────────────────────────────────

  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "history") {
    return (
      <History
        token={token}
        onBack={() => setPage("dashboard")}
      />
    );
  }

  // default — dashboard is public, no login required
  return (
    <Dashboard
      token={token}
      onLogout={handleLogout}
      onHistory={handleHistoryClick}
    />
  );
}