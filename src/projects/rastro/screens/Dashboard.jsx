import { useState } from "react";
import { Wrench, AlertTriangle, ShieldAlert, Gauge, Clock, ChevronRight, ClipboardPlus } from "lucide-react";
import StatusPill from "../components/StatusPill.jsx";
import AeronaveCard from "../components/AeronaveCard.jsx";
import OperacaoRow from "../components/OperacaoRow.jsx";
import OperacoesHeader from "../components/OperacoesHeader.jsx";
import { aeronaves, operacoes, naoConformidades, ferramentas } from "../data/mockData.js";

const TABS = [
  { id: "producao", label: "Produção" },
  { id: "operacoes", label: "Registro de operações" },
  { id: "nc", label: "Não conformidades" },
  { id: "ferramentas", label: "Ferramentas" },
];

export default function Dashboard({ onNovoRegistro }) {
  const [tab, setTab] = useState("producao");

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 60px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 4, background: "var(--stripe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: 3, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wrench size={12} color="var(--amber)" strokeWidth={2.5} />
              </div>
            </div>
            <span className="display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.01em" }}>RASTRO</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4, paddingLeft: 40 }}>
            controle de qualidade &amp; rastreabilidade de montagem
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <StatusPill icon={Gauge} label="EM PRODUÇÃO" value={aeronaves.length} tone="neutral" />
          <StatusPill icon={ShieldAlert} label="NC ABERTAS" value={naoConformidades.length} tone="red" />
          <StatusPill icon={Clock} label="CALIBRAÇÃO VENCENDO" value={ferramentas.length} tone="amber" />
          <button type="button" className="primary-btn focus-ring" onClick={onNovoRegistro} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px" }}>
            <ClipboardPlus size={15} /> Registrar operação
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--line)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="focus-ring"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 14px",
              fontSize: 13.5,
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: tab === t.id ? "var(--text)" : "var(--text-faint)",
              borderBottom: tab === t.id ? "2px solid var(--amber)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Aircraft grid — always visible as primary context */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginBottom: 28 }}>
        {aeronaves.map((a) => (
          <AeronaveCard key={a.serie} aeronave={a} />
        ))}
      </div>

      {tab === "producao" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 5, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="display" style={{ fontSize: 14, fontWeight: 600 }}>Últimas operações registradas</span>
              <button
                className="focus-ring mono"
                style={{ background: "none", border: "1px solid var(--line)", color: "var(--text-dim)", fontSize: 11.5, padding: "5px 10px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => setTab("operacoes")}
              >
                ver todas <ChevronRight size={12} />
              </button>
            </div>
            <OperacoesHeader />
            {operacoes.map((op) => (
              <OperacaoRow key={op.ponto + op.hora} operacao={op} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "var(--red-dim)", border: "1px solid #5a2f2b", borderRadius: 5, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={15} color="var(--red)" />
                <span className="display" style={{ fontSize: 13.5, fontWeight: 600 }}>Não conformidades recentes</span>
              </div>
              {naoConformidades.map((nc) => (
                <div key={nc.id} style={{ padding: "8px 0", borderTop: "1px solid #4a2825" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--red)", marginBottom: 2 }}>{nc.id} · {nc.os}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text)" }}>{nc.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--amber-dim)", border: "1px solid #7a5c14", borderRadius: 5, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Clock size={15} color="var(--amber)" />
                <span className="display" style={{ fontSize: 13.5, fontWeight: 600 }}>Calibração vencendo</span>
              </div>
              {ferramentas.map((f) => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid #5c4611" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text)" }}>{f.id}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--amber)" }}>{f.dias}d — {f.venc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "operacoes" && (
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 5, padding: 18 }}>
          <span className="display" style={{ fontSize: 14, fontWeight: 600 }}>Registro completo de operações</span>
          <div style={{ marginTop: 10 }}>
            <OperacoesHeader />
            {operacoes.map((op) => (
              <OperacaoRow key={op.ponto + op.hora} operacao={op} />
            ))}
          </div>
        </div>
      )}

      {tab === "nc" && (
        <div style={{ display: "grid", gap: 10 }}>
          {naoConformidades.map((nc) => (
            <div key={nc.id} className="tag card-hover" style={{ padding: "14px 16px 14px 26px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="tag-clip" />
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--red)" }}>{nc.id} · {nc.os}</div>
                <div style={{ fontSize: 13.5, marginTop: 3 }}>{nc.desc}</div>
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 10.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  padding: "4px 9px",
                  borderRadius: 3,
                  background: nc.sev === "alta" ? "var(--red-dim)" : "var(--amber-dim)",
                  color: nc.sev === "alta" ? "var(--red)" : "var(--amber)",
                }}
              >
                {nc.sev}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "ferramentas" && (
        <div style={{ display: "grid", gap: 10 }}>
          {ferramentas.map((f) => (
            <div key={f.id} className="tag card-hover" style={{ padding: "14px 16px 14px 26px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="tag-clip" />
              <div>
                <div className="mono" style={{ fontSize: 12.5 }}>{f.id}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 2 }}>{f.tipo}</div>
              </div>
              <span className="mono" style={{ fontSize: 12, color: "var(--amber)" }}>vence em {f.dias}d</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
