import { motion } from "framer-motion";

export default function OperadorCard({ operador }) {
  const restante = Math.max(operador.metaMensal - operador.horasNoMes, 0);
  const pct = Math.min((operador.horasNoMes / operador.metaMensal) * 100, 100);
  const emDia = operador.horasNoMes >= operador.metaMensal;

  return (
    <div className="tag card-hover" style={{ padding: "16px 16px 14px 26px" }}>
      <div className="tag-clip" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 14, color: "var(--text)" }}>{operador.nome}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)" }}>{operador.matricula}</span>
      </div>
      <div className="mono" style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>
        {operador.horasNoMes.toFixed(1)}h / {operador.metaMensal.toFixed(0)}h no mês
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 5, background: "var(--line-soft)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              background: emDia ? "var(--green)" : "var(--amber)",
              borderRadius: 3,
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-dim)", minWidth: 32, textAlign: "right" }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="mono" style={{ fontSize: 11.5, color: emDia ? "var(--green)" : "var(--amber)" }}>
        {emDia ? "meta do mês cumprida" : `faltam ${restante.toFixed(1)}h pra bater a meta`}
      </div>
    </div>
  );
}
