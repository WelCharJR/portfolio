import { Wind } from "lucide-react";

const SLIDERS = [
  { key: "pitch", label: "Manche — arfagem", min: -20, max: 20, step: 0.5, unit: "°" },
  { key: "roll", label: "Manche — inclinação", min: -45, max: 45, step: 1, unit: "°" },
  { key: "throttle", label: "Manete — velocidade alvo", min: 100, max: 340, step: 1, unit: " kt" },
];

export default function ManualControls({ mode, manual, setManualField, turbulence, setTurbulence }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Controles manuais {mode === "auto" ? "(desativados — piloto automático no comando)" : "· setas ↑↓←→ ou + / − no teclado"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px 28px" }}>
        {SLIDERS.map((s) => (
          <div key={s.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, color: "var(--dim)" }}>{s.label}</span>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--cyan)" }}>
                {Math.round(manual[s.key])}{s.unit}
              </span>
            </div>
            <input
              type="range"
              className="pfd-slider focus-ring"
              min={s.min}
              max={s.max}
              step={s.step}
              value={manual[s.key]}
              disabled={mode === "auto"}
              onChange={(e) => setManualField(s.key, parseFloat(e.target.value))}
            />
          </div>
        ))}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, color: "var(--dim)", display: "flex", alignItems: "center", gap: 5 }}>
              <Wind size={12} /> Turbulência
            </span>
            <span className="mono" style={{ fontSize: 12.5, color: "var(--cyan)" }}>{turbulence}/10</span>
          </div>
          <input
            type="range"
            className="pfd-slider focus-ring"
            min={0}
            max={10}
            step={1}
            value={turbulence}
            onChange={(e) => setTurbulence(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
