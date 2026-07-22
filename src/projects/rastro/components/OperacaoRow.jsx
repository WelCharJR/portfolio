import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function OperacaoRow({ operacao }) {
  return (
    <div
      className="mono"
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 0.8fr 0.9fr 1fr 0.7fr 0.6fr",
        gap: 12,
        padding: "10px 14px",
        fontSize: 12.5,
        borderBottom: "1px solid var(--line-soft)",
        alignItems: "center",
      }}
    >
      <span style={{ color: "var(--text)" }}>{operacao.ponto}</span>
      <span style={{ color: "var(--text-dim)" }}>{operacao.spec} Nm</span>
      <span style={{ color: operacao.ok ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
        {operacao.aplicado} Nm
      </span>
      <span style={{ color: "var(--text-dim)" }}>{operacao.ferramenta}</span>
      <span style={{ color: "var(--text-dim)", fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {operacao.operador}
      </span>
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
