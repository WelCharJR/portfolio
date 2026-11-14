import { motion } from "framer-motion";

export default function AeronaveCard({ aeronave }) {
  return (
    <div className="tag card-hover" style={{ padding: "16px 16px 14px 26px" }}>
      <div className="tag-clip" />
      <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.04em" }}>
        {aeronave.serie}
      </div>
      <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4, marginBottom: 14 }}>
        {aeronave.estacao}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 5, background: "var(--line-soft)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            initial={false}
            animate={{ width: `${aeronave.progresso}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              background: aeronave.status === "atencao" ? "var(--amber)" : "var(--green)",
              borderRadius: 3,
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-dim)", minWidth: 32, textAlign: "right" }}>
          {aeronave.progresso}%
        </span>
      </div>
    </div>
  );
}
