import { useState } from "react";
import { api } from "../api";
import "./Dashboard.css";

const UNITS = {
  LENGTH:      ["FEET", "INCHES", "YARDS", "CENTIMETERS"],
  WEIGHT:      ["KILOGRAM", "GRAM", "POUNDS"],
  VOLUME:      ["LITER", "MILLILITER", "GALLON"],
  TEMPERATURE: ["CELSIUS", "FAHRENHEIT", "KELVIN"],
};

const OPERATIONS = ["CONVERT", "ADD", "SUBTRACT", "DIVIDE", "COMPARE"];

const OP_ICONS = {
  CONVERT:  "⇄",
  ADD:      "+",
  SUBTRACT: "−",
  DIVIDE:   "÷",
  COMPARE:  "=",
};

// ── Sub-component: single quantity input row ──────────────────────────────────

function QuantityInput({ label, value, onChange, type, unit, onTypeChange, onUnitChange }) {
  const handleTypeChange = (e) => {
    onTypeChange(e.target.value);
    onUnitChange(UNITS[e.target.value][0]);
  };

  return (
    <div className="qty-input">
      <span className="qty-label">{label}</span>
      <div className="qty-row">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          className="qty-number"
        />
        <select value={type} onChange={handleTypeChange} className="qty-select">
          {Object.keys(UNITS).map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={unit} onChange={e => onUnitChange(e.target.value)} className="qty-select">
          {(UNITS[type] || []).map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
    </div>
  );
}

// ── Sub-component: result display ─────────────────────────────────────────────

function ResultBox({ result, error }) {
  if (error) {
    return (
      <div className="result-box error-box">
        <span className="result-icon">⚠</span>
        <span>{error}</span>
      </div>
    );
  }

  if (result === null) return null;

  const isBoolean  = typeof result === "boolean";
  const isPositive = result === true;

  const formatted = () => {
    if (isBoolean)                  return result ? "✓  Equal" : "✗  Not Equal";
    if (typeof result === "number") return result.toFixed(4);
    if (result.value !== undefined) return `${result.value.toFixed(4)} ${result.unit}`;
    return JSON.stringify(result);
  };

  return (
    <div className={`result-box ${isBoolean ? (isPositive ? "success-box" : "fail-box") : "success-box"}`}>
      <span className="result-label">Result</span>
      <span className="result-value">{formatted()}</span>
    </div>
  );
}

// ── Sub-component: navbar ─────────────────────────────────────────────────────

function Navbar({ token, onHistory, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-logo">⚖</span>
        <span className="nav-title">QMeasure</span>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        {token ? (
          <>
            <button className="btn-logout" onClick={onHistory}>History</button>
            <button className="btn-logout" onClick={onLogout}>Sign Out</button>
          </>
        ) : (
          <button className="btn-logout" onClick={onHistory}>
            Login to view History
          </button>
        )}
      </div>
    </nav>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard({ token, onLogout, onHistory }) {
  const [op, setOp] = useState("CONVERT");

  const [v1, setV1] = useState("10");
  const [t1, setT1] = useState("LENGTH");
  const [u1, setU1] = useState("FEET");

  const [v2, setV2] = useState("5");
  const [t2, setT2] = useState("LENGTH");
  const [u2, setU2] = useState("INCHES");

  const [targetUnit, setTargetUnit] = useState("INCHES");

  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const q1 = { value: parseFloat(v1), unit: u1, measurementType: t1 };
  const q2 = { value: parseFloat(v2), unit: u2, measurementType: t2 };

  const needsQ2     = ["ADD", "SUBTRACT", "DIVIDE", "COMPARE"].includes(op);
  const needsTarget = ["CONVERT", "ADD", "SUBTRACT"].includes(op);
  const typeMismatch = needsQ2 && t1 !== t2;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleOpChange = (o) => {
    setOp(o);
    setResult(null);
    setError("");
    // sync Q2 type+unit to Q1 to avoid "Different categories" error
    setT2(t1);
    setU2(UNITS[t1][0]);
  };

  const callApi = () => {
    switch (op) {
      case "CONVERT":  return api.convert(token, q1, targetUnit);
      case "ADD":      return api.add(token, q1, q2, targetUnit);
      case "SUBTRACT": return api.subtract(token, q1, q2, targetUnit);
      case "DIVIDE":   return api.divide(token, q1, q2);
      case "COMPARE":  return api.compare(token, q1, q2);
      default: throw new Error("Unknown operation");
    }
  };

  const handleRun = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      setResult(await callApi());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="dash-root">
      <div className="dash-bg">
        <div className="dash-orb orb-a" />
        <div className="dash-orb orb-b" />
        <div className="dash-grid" />
      </div>

      <Navbar token={token} onHistory={onHistory} onLogout={onLogout} />

      <main className="dash-main">

        {/* Operation selector */}
        <div className="op-bar">
          {OPERATIONS.map(o => (
            <button
              key={o}
              className={`op-btn ${op === o ? "active" : ""}`}
              onClick={() => handleOpChange(o)}
            >
              <span className="op-icon">{OP_ICONS[o]}</span>
              <span className="op-name">{o}</span>
            </button>
          ))}
        </div>

        {/* Calculator card */}
        <div className="calc-card">
          <div className="calc-header">
            <span className="calc-op-badge">{OP_ICONS[op]}</span>
            <h2>{op.charAt(0) + op.slice(1).toLowerCase()}</h2>
          </div>

          <div className="inputs-section">
            <QuantityInput
              label="Value 1"
              value={v1} onChange={setV1}
              type={t1} onTypeChange={setT1}
              unit={u1} onUnitChange={setU1}
            />

            {needsQ2 && (
              <>
                <div className="op-divider">{OP_ICONS[op]}</div>
                <QuantityInput
                  label="Value 2"
                  value={v2} onChange={setV2}
                  type={t2} onTypeChange={setT2}
                  unit={u2} onUnitChange={setU2}
                />
              </>
            )}

            {needsTarget && (
              <div className="target-row">
                <span className="qty-label">Target Unit</span>
                <select
                  value={targetUnit}
                  onChange={e => setTargetUnit(e.target.value)}
                  className="qty-select target-select"
                >
                  {(UNITS[t1] || []).map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Type mismatch warning */}
          {typeMismatch && (
            <div className="result-box error-box">
              <span className="result-icon">⚠</span>
              <span>Both values must be the same measurement type</span>
            </div>
          )}

          <button
            className="btn-run"
            onClick={handleRun}
            disabled={loading || typeMismatch}
          >
            {loading
              ? <span className="spinner-dark" />
              : `Run ${op.charAt(0) + op.slice(1).toLowerCase()}`}
          </button>

          <ResultBox result={result} error={error} />
        </div>

        {/* Supported units info */}
        <div className="info-grid">
          {Object.entries(UNITS).map(([type, units]) => (
            <div key={type} className="info-card">
              <h4>{type}</h4>
              <div className="unit-pills">
                {units.map(u => <span key={u} className="pill">{u}</span>)}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}