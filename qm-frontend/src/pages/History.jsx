import { useState, useEffect } from "react";
import { api } from "../api";
import "./History.css";

const OP_COLORS = {
  CONVERT:  "#6c3bff",
  ADD:      "#00d4aa",
  SUBTRACT: "#ff6b6b",
  DIVIDE:   "#f59e0b",
  COMPARE:  "#3b82f6",
};

const OP_ICONS = {
  CONVERT:  "⇄",
  ADD:      "+",
  SUBTRACT: "−",
  DIVIDE:   "÷",
  COMPARE:  "=",
};

export default function History({ token, onBack }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("ALL");

  useEffect(() => {
    api.history(token)
      .then(data => setRecords(data.reverse())) // newest first
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const operations = ["ALL", "CONVERT", "ADD", "SUBTRACT", "DIVIDE", "COMPARE"];

  const filtered = filter === "ALL"
    ? records
    : records.filter(r => r.operation === filter);

  const formatResult = (record) => {
    if (record.operation === "COMPARE") {
      return record.booleanResult ? "✓ Equal" : "✗ Not Equal";
    }
    return record.numericResult.toFixed(4);
  };

  return (
    <div className="history-root">
      <div className="dash-bg">
        <div className="dash-orb orb-a" />
        <div className="dash-orb orb-b" />
        <div className="dash-grid" />
      </div>

      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">⚖</span>
          <span className="nav-title">QMeasure</span>
        </div>
        <button className="btn-logout" onClick={onBack}>← Back</button>
      </nav>

      <main className="history-main">
        <div className="history-header">
          <h2>Operation History</h2>
          <p className="history-sub">{records.length} operations recorded</p>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          {operations.map(op => (
            <button
              key={op}
              className={`filter-btn ${filter === op ? "active" : ""}`}
              style={filter === op && op !== "ALL"
                ? { borderColor: OP_COLORS[op], color: OP_COLORS[op], background: OP_COLORS[op] + "20" }
                : {}}
              onClick={() => setFilter(op)}
            >
              {op !== "ALL" && <span>{OP_ICONS[op]}</span>}
              {op}
            </button>
          ))}
        </div>

        {loading && (
          <div className="history-loading">
            <span className="spinner-dark" />
            <span>Loading history...</span>
          </div>
        )}

        {error && (
          <div className="history-error">⚠ {error}</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="history-empty">
            <span>No operations found</span>
          </div>
        )}

        <div className="history-list">
          {filtered.map((record, i) => (
            <div key={record.id} className="history-card" style={{ animationDelay: `${i * 0.05}s` }}>
              
              <div className="hcard-left">
                <span
                  className="hcard-op-badge"
                  style={{ background: (OP_COLORS[record.operation] || "#6c3bff") + "25",
                           color: OP_COLORS[record.operation] || "#6c3bff",
                           border: `1px solid ${(OP_COLORS[record.operation] || "#6c3bff")}40` }}
                >
                  {OP_ICONS[record.operation]} {record.operation}
                </span>

                <div className="hcard-values">
                  <span className="hcard-val">
                    {record.value1} <em>{record.unit1}</em>
                  </span>
                  {record.unit2 !== "-" && (
                    <>
                      <span className="hcard-op-sym">
                        {OP_ICONS[record.operation]}
                      </span>
                      <span className="hcard-val">
                        {record.value2} <em>{record.unit2}</em>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="hcard-right">
                <span className="hcard-result-label">Result</span>
                <span
                  className="hcard-result"
                  style={{ color: record.operation === "COMPARE"
                    ? (record.booleanResult ? "#00d4aa" : "#ff6b6b")
                    : "#00d4aa" }}
                >
                  {formatResult(record)}
                </span>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}