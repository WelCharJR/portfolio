import { useState, useMemo } from "react";
import { ArrowLeft, Wrench, ScanLine, CheckCircle2, AlertTriangle, User, RotateCcw } from "lucide-react";
import Select from "../components/Select.jsx";
import { aeronaves, pontos } from "../data/mockData.js";

function Row({ k, v, vColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line-soft)", paddingTop: 8 }}>
      <span style={{ color: "var(--text-faint)" }}>{k}</span>
      <span className="mono" style={{ color: vColor || "var(--text)" }}>{v}</span>
    </div>
  );
}

export default function RegistroOperacao({ onVoltar }) {
  const [aeronave, setAeronave] = useState(null);
  const [ponto, setPonto] = useState(null);
  const [ferramenta, setFerramenta] = useState("");
  const [operador, setOperador] = useState("");
  const [valor, setValor] = useState("");
  const [salvo, setSalvo] = useState(false);

  const numero = parseFloat(valor.replace(",", "."));
  const status = useMemo(() => {
    if (!ponto || !valor || isNaN(numero)) return null;
    return numero >= ponto.min && numero <= ponto.max ? "ok" : "nc";
  }, [ponto, valor, numero]);

  const pronto = aeronave && ponto && ferramenta && operador && valor && !salvo;

  function registrar() {
    if (!pronto) return;
    setSalvo(true);
  }

  function novoRegistro() {
    setPonto(null);
    setFerramenta("");
    setValor("");
    setSalvo(false);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "26px 20px 60px" }}>
      {/* Header */}
      <button
        type="button"
        className="focus-ring"
        onClick={onVoltar}
        style={{ background: "none", border: "none", color: "var(--text-faint)", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: 0, marginBottom: 18 }}
      >
        <ArrowLeft size={13} /> voltar ao painel
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <div style={{ width: 28, height: 28, borderRadius: 4, background: "var(--stripe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 19, height: 19, borderRadius: 3, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wrench size={11} color="var(--amber)" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <div className="display" style={{ fontSize: 17, fontWeight: 700 }}>Registrar operação de torque</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>estação 4 — junção de asa</div>
        </div>
      </div>

      {!salvo ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Select
            label="Aeronave"
            value={aeronave}
            placeholder="selecionar número de série"
            options={aeronaves.map((a) => a.serie)}
            onSelect={setAeronave}
            render={(v) => v}
          />

          <Select
            label="Ponto de fixação"
            value={ponto}
            placeholder="selecionar ponto"
            options={pontos}
            optionKey={(p) => p.id}
            onSelect={setPonto}
            render={(v) => v.label}
          />

          {ponto && (
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 5, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>Faixa especificada</span>
              <span className="mono" style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>
                {ponto.min.toFixed(1)}–{ponto.max.toFixed(1)} Nm
              </span>
            </div>
          )}

          <div>
            <label className="mono" style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
              Ferramenta
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="field-input focus-ring mono"
                style={{ flex: 1 }}
                placeholder="código da chave dinamométrica"
                value={ferramenta}
                onChange={(e) => setFerramenta(e.target.value)}
              />
              <button type="button" className="ghost-btn focus-ring" style={{ padding: "0 16px", display: "flex", alignItems: "center" }} aria-label="Escanear código da ferramenta">
                <ScanLine size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className="mono" style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
              Operador
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} color="var(--text-faint)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                className="field-input focus-ring"
                style={{ paddingLeft: 40 }}
                placeholder="matrícula do operador"
                value={operador}
                onChange={(e) => setOperador(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mono" style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
              Valor aplicado (Nm)
            </label>
            <input
              className="field-input focus-ring mono"
              style={{
                fontSize: 26,
                fontWeight: 600,
                textAlign: "center",
                padding: "16px",
                borderColor: status === "ok" ? "var(--green)" : status === "nc" ? "var(--red)" : "var(--line)",
              }}
              placeholder="0.0"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
            {status && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 9, justifyContent: "center" }}>
                {status === "ok" ? (
                  <>
                    <CheckCircle2 size={15} color="var(--green)" />
                    <span style={{ fontSize: 13, color: "var(--green)" }}>Dentro da faixa especificada</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} color="var(--red)" />
                    <span style={{ fontSize: 13, color: "var(--red)" }}>Fora da faixa — será aberta uma não conformidade</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button type="button" className="primary-btn focus-ring" disabled={!pronto} onClick={registrar} style={{ marginTop: 6 }}>
            Registrar operação
          </button>
        </div>
      ) : (
        <div className="tag" style={{ padding: "22px 20px 22px 30px", textAlign: "left" }}>
          <div className="tag-clip" />
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            {status === "ok" ? (
              <CheckCircle2 size={20} color="var(--green)" />
            ) : (
              <AlertTriangle size={20} color="var(--red)" />
            )}
            <span className="display" style={{ fontSize: 16, fontWeight: 600 }}>
              {status === "ok" ? "Operação conforme registrada" : "Registrado — não conformidade aberta"}
            </span>
          </div>
          <div style={{ display: "grid", gap: 8, fontSize: 13.5 }}>
            <Row k="Aeronave" v={aeronave} />
            <Row k="Ponto" v={ponto.label} />
            <Row k="Especificado" v={`${ponto.min.toFixed(1)}–${ponto.max.toFixed(1)} Nm`} />
            <Row k="Aplicado" v={`${valor} Nm`} vColor={status === "ok" ? "var(--green)" : "var(--red)"} />
            <Row k="Ferramenta" v={ferramenta} />
            <Row k="Operador" v={operador} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button type="button" className="ghost-btn focus-ring" onClick={novoRegistro} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <RotateCcw size={14} /> Novo registro
            </button>
            <button type="button" className="ghost-btn focus-ring" onClick={onVoltar} style={{ flex: 1 }}>
              Voltar ao painel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
