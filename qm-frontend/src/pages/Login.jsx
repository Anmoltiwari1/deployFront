import { useState } from "react";
import { api } from "../api";
import "./Login.css";

export default function Login({ onLogin, onBack }) {
  const [mode, setMode]         = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn   = mode === "login" ? api.login : api.register;
      const data = await fn(username, password);
      localStorage.setItem("jwt_token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError("");
  };

  const handleGitHub = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="grid-lines" />
      </div>

      <div className="login-card">

        {/* Back button — only shown when coming from Dashboard */}
        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← Back to calculator
          </button>
        )}

        <div className="login-header">
          <div className="logo">⚖</div>
          <h1>Quantity<br />Measurement</h1>
          <p className="tagline">Login to access your operation history</p>
        </div>

        {/* Sign In / Register tabs */}
        <div className="tab-row">
          <button
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => handleModeSwitch("login")}
          >
            Sign In
          </button>
          <button
            className={`tab ${mode === "register" ? "active" : ""}`}
            onClick={() => handleModeSwitch("register")}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Email / Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="anmol@example.com"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <span className="spinner" />
              : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="divider"><span>or continue with</span></div>

        {/* GitHub OAuth2 */}
        <button className="btn-github" onClick={handleGitHub}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

      </div>
    </div>
  );
}