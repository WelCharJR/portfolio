import { motion } from "framer-motion";

export default function ProcessoCard({ processo }) {
  const restante = Math.max(processo.horasEstimadas - processo.horasRealizadas, 0);
  const pct = Math.min((processo.horasRealizadas / processo.horasEstimadas) * 100, 100);
  const concluido = processo.horasRealizadas >= processo.horasEstimadas;

  return (
    <div className="tag card-hover" style={{ padding: "16px 16px 14px 26px" }}>
      <div className="tag-clip" />
      <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.04em" }}>
        {processo.id}
      </div>
      <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4, marginBottom: 12 }}>
        {processo.nome}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 5, background: "var(--line-soft)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              background: concluido ? "var(--green)" : "var(--amber)",
              borderRadius: 3,
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-dim)", minWidth: 32, textAlign: "right" }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="mono" style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
        {processo.horasRealizadas.toFixed(0)}h realizadas / {processo.horasEstimadas.toFixed(0)}h estimadas
      </div>
      <div className="mono" style={{ fontSize: 11.5, color: concluido ? "var(--green)" : "var(--amber)", marginTop: 2 }}>
        {concluido ? "processo concluído" : `faltam ${restante.toFixed(0)}h pra finalizar`}
      </div>
    </div>
  );
}
