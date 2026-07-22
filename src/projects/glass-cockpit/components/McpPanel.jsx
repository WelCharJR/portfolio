import { ArrowDownCircle, Plane, RefreshCcw } from "lucide-react";
import { clamp } from "../utils/math.js";

const FIELDS = [
  { key: "heading", label: "PROA", min: 0, max: 359, step: 1 },
  { key: "altitude", label: "ALTITUDE", min: 0, max: 25000, step: 100 },
  { key: "airspeed", label: "VELOCIDADE", min: 100, max: 340, step: 5 },
];

export default function McpPanel({ targets, setTarget, scenarioActive, runScenario }) {
  return (
    <div style={{ marginTop: 20, background: "var(--bezel)", border: "1px solid #2a2d30", borderRadius: 8, padding: "14px 16px" }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        MCP — painel de comando do piloto automático
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {FIELDS.map((f) => (
          <div key={f.key} className="mcp-field">
            <label className="mono" style={{ fontSize: 10.5, color: "var(--dim)", display: "block", marginBottom: 5 }}>{f.label}</label>
            <input
              type="number"
              min={f.min}
              max={f.max}
              step={f.step}
              value={Math.round(targets[f.key])}
              onChange={(e) => setTarget(f.key, clamp(parseFloat(e.target.value) || 0, f.min, f.max))}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button type="button" className="ctrl-btn focus-ring" disabled={scenarioActive} onClick={() => runScenario("subida")}>
          <Plane size={13} /> Cenário: subida
        </button>
        <button type="button" className="ctrl-btn focus-ring" disabled={scenarioActive} onClick={() => runScenario("descida")}>
          <ArrowDownCircle size={13} /> Cenário: descida
        </button>
        <button type="button" className="ctrl-btn focus-ring" disabled={scenarioActive} onClick={() => runScenario("curva")}>
          <RefreshCcw size={13} /> {scenarioActive ? "Executando curva de 360°..." : "Cenário: curva de 360°"}
        </button>
      </div>
    </div>
  );
}
