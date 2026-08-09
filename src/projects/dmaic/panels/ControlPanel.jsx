import { CheckCircle2, BookOpen } from "lucide-react";
import ControlChart from "../components/ControlChart.jsx";
import { controlPlan, licoesAprendidas } from "../data/mockData.js";

export default function ControlPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Carta de controle (p) — pós-melhoria</div>
          <ControlChart />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <CheckCircle2 size={13} color="var(--green)" />
            <span style={{ fontSize: 11.5, color: "var(--green)" }}>processo sob controle estatístico — nenhum ponto fora dos limites</span>
          </div>
        </div>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Plano de controle</div>
          <table className="dmaic-table">
            <thead><tr><th>Item</th><th>Frequência</th><th>Resp.</th><th>Reação</th></tr></thead>
            <tbody>
              {controlPlan.map((c) => (
                <tr key={c.item}>
                  <td>{c.item}</td>
                  <td className="mono">{c.frequencia}</td>
                  <td>{c.resp}</td>
                  <td style={{ color: "var(--ink-dim)" }}>{c.reacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <BookOpen size={15} color="var(--green)" />
          <span className="display" style={{ fontSize: 14, fontWeight: 700 }}>Padronização e lições aprendidas</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--ink-dim)", lineHeight: 1.8 }}>
          {licoesAprendidas.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
