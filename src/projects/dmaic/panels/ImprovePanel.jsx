import { ArrowRight, DollarSign } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import FmeaTable from "../components/FmeaTable.jsx";
import { actionPlan } from "../data/mockData.js";

export default function ImprovePanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card">
        <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Plano de ação</div>
        <table className="dmaic-table">
          <thead><tr><th>Causa</th><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead>
          <tbody>
            {actionPlan.map((a) => (
              <tr key={a.causa}>
                <td>{a.causa}</td>
                <td>{a.acao}</td>
                <td>{a.resp}</td>
                <td className="mono">{a.prazo}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>FMEA — priorização das ações por risco</div>
        <FmeaTable />
        <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 8 }}>
          NPR = Severidade × Ocorrência × Detecção — a linha em vermelho (NPR ≥ 150) foi tratada primeiro.
        </p>
      </div>
      <div className="card">
        <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Resultado do piloto</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: "var(--red)" }}>8,4%</div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>antes</div>
          </div>
          <ArrowRight size={22} color="var(--ink-faint)" />
          <div style={{ textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>2,1%</div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>depois do piloto</div>
          </div>
          <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green)", fontSize: 13, padding: "6px 12px" }}>
            −75% de NC
          </span>
          <span className="pill" style={{ background: "var(--blue-soft)", color: "var(--blue)", fontSize: 13, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}>
            <DollarSign size={12} /> ~R$ 34 mil/trimestre economizados
          </span>
        </div>
      </div>
    </div>
  );
}
