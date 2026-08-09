import { hypothesisGroups } from "../data/mockData.js";

export default function TwoGroupTest() {
  const max = 18;
  const barH = (r) => (r / max) * 100;

  return (
    <div>
      <div style={{ display: "flex", gap: 30, alignItems: "flex-end", height: 130, marginBottom: 10 }}>
        {hypothesisGroups.map((g) => (
          <div key={g.label} style={{ textAlign: "center" }}>
            <div style={{ height: 100, display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: 54, height: `${barH(g.rate)}%`, background: g.color, borderRadius: "3px 3px 0 0" }} />
            </div>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: g.color, marginTop: 4 }}>{g.rate}%</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-dim)", maxWidth: 100, marginTop: 2 }}>{g.label}</div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-faint)" }}>n = {g.n}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "8px 10px", background: "var(--blue-soft)", borderRadius: 5 }}>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--blue)" }}>
          teste z de duas proporções: z = 4,87 · p &lt; 0,001
        </span>
        <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginTop: 3 }}>
          diferença estatisticamente significativa — calibração vencida não é coincidência, é causa raiz confirmada.
        </div>
      </div>
    </div>
  );
}
