import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wrench, AlertTriangle, ShieldAlert, Gauge, Clock, ChevronRight, ClipboardPlus, Users, Search, CheckCircle2, RotateCcw, PlusCircle, Plane, Crosshair } from "lucide-react";
import StatusPill from "../components/StatusPill.jsx";
import AeronaveCard from "../components/AeronaveCard.jsx";
import OperacaoRow from "../components/OperacaoRow.jsx";
import OperacoesHeader from "../components/OperacoesHeader.jsx";
import OperadorCard from "../components/OperadorCard.jsx";
import ProcessoCard from "../components/ProcessoCard.jsx";
import Modal from "../components/Modal.jsx";
import { useRastroState, useRastroDispatch } from "../state/RastroContext.jsx";

const TABS = [
  { id: "producao", label: "Produção" },
  { id: "operacoes", label: "Registro de operações" },
  { id: "horas", label: "Horas" },
  { id: "nc", label: "Não conformidades" },
  { id: "ferramentas", label: "Ferramentas" },
];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="mono" style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", maxWidth: 320, marginBottom: 14 }}>
      <Search size={14} color="var(--text-faint)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input
        className="field-input focus-ring mono"
        style={{ paddingLeft: 34, fontSize: 12.5, padding: "9px 12px 9px 34px" }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function Dashboard({ onNovoRegistro, notify }) {
  const [tab, setTab] = useState("producao");
  const [buscaOperacoes, setBuscaOperacoes] = useState("");
  const [buscaNc, setBuscaNc] = useState("");
  const [buscaFerramentas, setBuscaFerramentas] = useState("");
  const [ncFiltro, setNcFiltro] = useState("aberta");

  const [modalAeronave, setModalAeronave] = useState(false);
  const [modalPonto, setModalPonto] = useState(false);
  const [novaSerie, setNovaSerie] = useState("");
  const [novaEstacao, setNovaEstacao] = useState("");
  const [novoLabel, setNovoLabel] = useState("");
  const [novoMin, setNovoMin] = useState("");
  const [novoMax, setNovoMax] = useState("");
  const [erroForm, setErroForm] = useState("");

  const { aeronaves, operacoes, naoConformidades, ferramentas, operadores, processos, pontos } = useRastroState();
  const dispatch = useRastroDispatch();

  function avisar(msg, tone) {
    if (notify) notify(msg, tone);
  }

  function fecharModalAeronave() {
    setModalAeronave(false);
    setNovaSerie("");
    setNovaEstacao("");
    setErroForm("");
  }

  function fecharModalPonto() {
    setModalPonto(false);
    setNovoLabel("");
    setNovoMin("");
    setNovoMax("");
    setErroForm("");
  }

  function salvarAeronave(e) {
    e.preventDefault();
    const serie = novaSerie.trim();
    const estacao = novaEstacao.trim();
    if (!serie || !estacao) {
      setErroForm("Preencha o número de série e a estação.");
      return;
    }
    if (aeronaves.some((a) => a.serie === serie)) {
      setErroForm("Já existe uma aeronave com esse número de série.");
      return;
    }
    dispatch({ type: "CADASTRAR_AERONAVE", payload: { serie, estacao } });
    avisar(`Aeronave ${serie} cadastrada`, "green");
    fecharModalAeronave();
  }

  function salvarPonto(e) {
    e.preventDefault();
    const label = novoLabel.trim();
    const min = parseFloat(novoMin.replace(",", "."));
    const max = parseFloat(novoMax.replace(",", "."));
    if (!label || isNaN(min) || isNaN(max)) {
      setErroForm("Preencha a descrição e os dois valores de torque.");
      return;
    }
    if (min >= max) {
      setErroForm("O valor mínimo precisa ser menor que o máximo.");
      return;
    }
    if (pontos.some((p) => p.label.toLowerCase() === label.toLowerCase())) {
      setErroForm("Já existe um ponto de fixação com essa descrição.");
      return;
    }
    dispatch({ type: "CADASTRAR_PONTO", payload: { label, min, max } });
    avisar(`Ponto de fixação "${label}" cadastrado`, "green");
    fecharModalPonto();
  }

  const ncAbertas = useMemo(() => naoConformidades.filter((n) => n.status !== "resolvida"), [naoConformidades]);

  const operacoesFiltradas = useMemo(() => {
    const q = buscaOperacoes.trim().toLowerCase();
    if (!q) return operacoes;
    return operacoes.filter((op) =>
      [op.ponto, op.ferramenta, op.operador, op.op].join(" ").toLowerCase().includes(q)
    );
  }, [operacoes, buscaOperacoes]);

  const ncFiltradas = useMemo(() => {
    const q = buscaNc.trim().toLowerCase();
    return naoConformidades
      .filter((nc) => (ncFiltro === "todas" ? true : (nc.status || "aberta") === ncFiltro))
      .filter((nc) => !q || [nc.id, nc.desc, nc.os].join(" ").toLowerCase().includes(q));
  }, [naoConformidades, buscaNc, ncFiltro]);

  const ferramentasFiltradas = useMemo(() => {
    const q = buscaFerramentas.trim().toLowerCase();
    if (!q) return ferramentas;
    return ferramentas.filter((f) => [f.id, f.tipo].join(" ").toLowerCase().includes(q));
  }, [ferramentas, buscaFerramentas]);

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
          <motion.div key={aeronaves.length} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <StatusPill icon={Gauge} label="EM PRODUÇÃO" value={aeronaves.length} tone="neutral" />
          </motion.div>
          <motion.div key={`nc-${ncAbertas.length}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <StatusPill icon={ShieldAlert} label="NC ABERTAS" value={ncAbertas.length} tone="red" />
          </motion.div>
          <StatusPill icon={Clock} label="CALIBRAÇÃO VENCENDO" value={ferramentas.length} tone="amber" />
          <motion.button
            type="button"
            className="ghost-btn focus-ring"
            onClick={() => setModalAeronave(true)}
            whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", fontSize: 13 }}
          >
            <Plane size={14} /> Nova aeronave
          </motion.button>
          <motion.button
            type="button"
            className="ghost-btn focus-ring"
            onClick={() => setModalPonto(true)}
            whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", fontSize: 13 }}
          >
            <Crosshair size={14} /> Novo ponto
          </motion.button>
          <motion.button
            type="button"
            className="primary-btn focus-ring"
            onClick={onNovoRegistro}
            whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px" }}
          >
            <ClipboardPlus size={15} /> Registrar operação
          </motion.button>
        </div>
      </div>

      <Modal open={modalAeronave} onClose={fecharModalAeronave} title="Cadastrar nova aeronave">
        <form onSubmit={salvarAeronave}>
          <Field label="Número de série">
            <input
              className="field-input focus-ring mono"
              placeholder="ex.: E195-E2 · MSN 7736"
              value={novaSerie}
              onChange={(e) => setNovaSerie(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Estação / etapa atual">
            <input
              className="field-input focus-ring"
              placeholder="ex.: Montagem Final"
              value={novaEstacao}
              onChange={(e) => setNovaEstacao(e.target.value)}
            />
          </Field>
          {erroForm && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--red)", fontSize: 12.5, marginBottom: 12 }}>
              <AlertTriangle size={13} /> {erroForm}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" className="ghost-btn focus-ring" onClick={fecharModalAeronave} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn focus-ring" style={{ flex: 1 }}>
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={modalPonto} onClose={fecharModalPonto} title="Cadastrar novo ponto de fixação">
        <form onSubmit={salvarPonto}>
          <Field label="Descrição do ponto">
            <input
              className="field-input focus-ring"
              placeholder="ex.: Longarina EF — P.15C"
              value={novoLabel}
              onChange={(e) => setNovoLabel(e.target.value)}
              autoFocus
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Mínimo (Nm)">
              <input
                className="field-input focus-ring mono"
                inputMode="decimal"
                placeholder="0.0"
                value={novoMin}
                onChange={(e) => setNovoMin(e.target.value)}
              />
            </Field>
            <Field label="Máximo (Nm)">
              <input
                className="field-input focus-ring mono"
                inputMode="decimal"
                placeholder="0.0"
                value={novoMax}
                onChange={(e) => setNovoMax(e.target.value)}
              />
            </Field>
          </div>
          {erroForm && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--red)", fontSize: 12.5, marginBottom: 12 }}>
              <AlertTriangle size={13} /> {erroForm}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" className="ghost-btn focus-ring" onClick={fecharModalPonto} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn focus-ring" style={{ flex: 1 }}>
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--line)", position: "relative" }}>
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
              position: "relative",
              marginBottom: -1,
            }}
          >
            {t.label}
            {tab === t.id && (
              <motion.div
                layoutId="tab-underline"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "var(--amber)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Aircraft grid — always visible as primary context */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginBottom: 28 }}
      >
        {aeronaves.map((a) => (
          <motion.div key={a.serie} variants={itemVariants} layout>
            <AeronaveCard aeronave={a} />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
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
                <motion.div variants={listVariants} initial="hidden" animate="show">
                  <AnimatePresence initial={false}>
                    {operacoes.slice(0, 6).map((op) => (
                      <motion.div key={op.ponto + op.hora} variants={itemVariants} layout exit={{ opacity: 0 }}>
                        <OperacaoRow operacao={op} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "var(--red-dim)", border: "1px solid #5a2f2b", borderRadius: 5, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <AlertTriangle size={15} color="var(--red)" />
                    <span className="display" style={{ fontSize: 13.5, fontWeight: 600 }}>Não conformidades recentes</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {ncAbertas.slice(0, 4).map((nc) => (
                      <motion.div key={nc.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                        <div style={{ padding: "8px 0", borderTop: "1px solid #4a2825" }}>
                          <div className="mono" style={{ fontSize: 11, color: "var(--red)", marginBottom: 2 }}>{nc.id} · {nc.os}</div>
                          <div style={{ fontSize: 12.5, color: "var(--text)" }}>{nc.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                    {ncAbertas.length === 0 && (
                      <div style={{ padding: "8px 0", fontSize: 12.5, color: "var(--text-faint)" }}>nenhuma NC aberta</div>
                    )}
                  </AnimatePresence>
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
                <SearchInput value={buscaOperacoes} onChange={setBuscaOperacoes} placeholder="buscar por ponto, ferramenta, operador ou OP..." />
                <OperacoesHeader />
                <motion.div variants={listVariants} initial="hidden" animate="show">
                  <AnimatePresence initial={false}>
                    {operacoesFiltradas.map((op) => (
                      <motion.div key={op.ponto + op.hora} variants={itemVariants} layout exit={{ opacity: 0 }}>
                        <OperacaoRow operacao={op} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {operacoesFiltradas.length === 0 && (
                    <div style={{ padding: "16px 0", fontSize: 12.5, color: "var(--text-faint)" }}>nenhuma operação encontrada</div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {tab === "horas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Users size={15} color="var(--text-dim)" />
                  <span className="display" style={{ fontSize: 14, fontWeight: 600 }}>Horas por operador no mês</span>
                </div>
                <motion.div variants={listVariants} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  {operadores.map((o) => (
                    <motion.div key={o.matricula} variants={itemVariants} layout>
                      <OperadorCard operador={o} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Gauge size={15} color="var(--text-dim)" />
                  <span className="display" style={{ fontSize: 14, fontWeight: 600 }}>Horas por processo (ordem de produção)</span>
                </div>
                <motion.div variants={listVariants} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                  {processos.map((p) => (
                    <motion.div key={p.id} variants={itemVariants} layout>
                      <ProcessoCard processo={p} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          )}

          {tab === "nc" && (
            <div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
                <SearchInput value={buscaNc} onChange={setBuscaNc} placeholder="buscar por id, descrição ou OS..." />
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {[
                    { id: "aberta", label: "abertas" },
                    { id: "resolvida", label: "resolvidas" },
                    { id: "todas", label: "todas" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setNcFiltro(f.id)}
                      className="focus-ring mono"
                      style={{
                        background: ncFiltro === f.id ? "var(--panel-raised)" : "none",
                        border: "1px solid var(--line)",
                        color: ncFiltro === f.id ? "var(--text)" : "var(--text-faint)",
                        fontSize: 11.5,
                        padding: "8px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <motion.div variants={listVariants} initial="hidden" animate="show" style={{ display: "grid", gap: 10 }}>
                <AnimatePresence initial={false}>
                  {ncFiltradas.map((nc) => {
                    const resolvida = nc.status === "resolvida";
                    return (
                      <motion.div
                        key={nc.id}
                        variants={itemVariants}
                        layout
                        exit={{ opacity: 0, x: 20 }}
                        className="tag card-hover"
                        style={{ padding: "14px 16px 14px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, opacity: resolvida ? 0.6 : 1 }}
                      >
                        <div className="tag-clip" />
                        <div>
                          <div className="mono" style={{ fontSize: 11, color: resolvida ? "var(--text-faint)" : "var(--red)" }}>{nc.id} · {nc.os}</div>
                          <div style={{ fontSize: 13.5, marginTop: 3, textDecoration: resolvida ? "line-through" : "none" }}>{nc.desc}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                              whiteSpace: "nowrap",
                            }}
                          >
                            {nc.sev}
                          </span>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => dispatch({ type: "RESOLVER_NC", payload: { id: nc.id } })}
                            className="ghost-btn focus-ring"
                            style={{ padding: "6px 10px", fontSize: 11.5, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                          >
                            {resolvida ? <RotateCcw size={12} /> : <CheckCircle2 size={12} />}
                            {resolvida ? "reabrir" : "resolver"}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {ncFiltradas.length === 0 && (
                  <div style={{ padding: "16px 0", fontSize: 12.5, color: "var(--text-faint)" }}>nenhuma não conformidade encontrada</div>
                )}
              </motion.div>
            </div>
          )}

          {tab === "ferramentas" && (
            <div>
              <SearchInput value={buscaFerramentas} onChange={setBuscaFerramentas} placeholder="buscar por código ou tipo..." />
              <motion.div variants={listVariants} initial="hidden" animate="show" style={{ display: "grid", gap: 10 }}>
                {ferramentasFiltradas.map((f) => (
                  <motion.div
                    key={f.id}
                    variants={itemVariants}
                    layout
                    className="tag card-hover"
                    style={{ padding: "14px 16px 14px 26px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div className="tag-clip" />
                    <div>
                      <div className="mono" style={{ fontSize: 12.5 }}>{f.id}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 2 }}>{f.tipo}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--amber)" }}>vence em {f.dias}d</span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => dispatch({ type: "RENOVAR_FERRAMENTA", payload: { id: f.id } })}
                        className="ghost-btn focus-ring"
                        style={{ padding: "6px 10px", fontSize: 11.5 }}
                      >
                        renovar calibração
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {ferramentasFiltradas.length === 0 && (
                  <div style={{ padding: "16px 0", fontSize: 12.5, color: "var(--text-faint)" }}>nenhuma ferramenta encontrada</div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
