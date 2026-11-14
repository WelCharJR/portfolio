import { CheckCircle2, AlertTriangle } from "lucide-react";
import { OPERACOES_GRID } from "./operacoesGrid.js";

export default function OperacaoRow({ operacao }) {
  return (
    <div
      className="mono"
      style={{
        display: "grid",
        gridTemplateColumns: OPERACOES_GRID,
        gap: 10,
        padding: "10px 14px",
        fontSize: 12.5,
        borderBottom: "1px solid var(--line-soft)",
        alignItems: "center",
      }}
    >
      <span style={{ color: "var(--text)" }}>
        <span style={{ display: "block" }}>{operacao.ponto}</span>
        <span style={{ display: "block", color: "var(--text-faint)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10.5, marginTop: 3 }}>
          {operacao.aeronaveSerie || "Aeronave não informada"} · {operacao.data ? operacao.data.split("-").reverse().join("/") : "data não informada"}
        </span>
      </span>
      <span style={{ color: "var(--text-dim)" }}>{operacao.spec} Nm</span>
      <span style={{ color: operacao.ok ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
        {operacao.aplicado} Nm
      </span>
      <span style={{ color: "var(--text-dim)" }}>{operacao.ferramenta}</span>
      <span style={{ color: "var(--text-dim)", fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {operacao.operador}
      </span>
      <span style={{ color: "var(--text-dim)" }}>{operacao.op}</span>
      <span style={{ color: "var(--text)" }}>{operacao.horas.toFixed(1)}h</span>
      <span style={{ color: "var(--text-faint)" }}>{operacao.hora}</span>
      <span style={{ display: "flex", justifyContent: "flex-end" }}>
        {operacao.ok ? (
          <CheckCircle2 size={15} color="var(--green)" strokeWidth={2} />
        ) : (
          <AlertTriangle size={15} color="var(--red)" strokeWidth={2} />
        )}
      </span>
    </div>
  );
}
