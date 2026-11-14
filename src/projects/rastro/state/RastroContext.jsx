import { createContext, useContext, useEffect, useReducer } from "react";
import {
  aeronaves as seedAeronaves,
  operacoes as seedOperacoes,
  operadores as seedOperadores,
  processos as seedProcessos,
  naoConformidades as seedNaoConformidades,
  ferramentas as seedFerramentas,
  pontos,
} from "../data/mockData.js";

const STORAGE_KEY = "rastro-state-v1";

function loadInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage indisponível ou corrompido — segue com os dados de exemplo
  }
  return {
    aeronaves: seedAeronaves,
    operacoes: seedOperacoes,
    operadores: seedOperadores,
    processos: seedProcessos,
    naoConformidades: seedNaoConformidades,
    ferramentas: seedFerramentas,
  };
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function reducer(state, action) {
  switch (action.type) {
    case "REGISTRAR_OPERACAO": {
      const { aeronaveSerie, ponto, ferramenta, operador, valor } = action.payload;
      const numero = parseFloat(String(valor).replace(",", "."));
      const ok = numero >= ponto.min && numero <= ponto.max;

      // Processo ativo = o que está ligado à aeronave selecionada (simplificação: primeiro processo
      // cujo nome cita o número de série, senão o processo com menos horas realizadas em relação à meta).
      const processoAlvo =
        state.processos.find((p) => aeronaveSerie.includes(p.nome.split("MSN ")[1] || "__none__")) ||
        state.processos[0];

      const novaOperacao = {
        ponto: ponto.label,
        spec: `${ponto.min.toFixed(1)}–${ponto.max.toFixed(1)}`,
        aplicado: String(valor).replace(",", "."),
        ferramenta,
        operador,
        hora: nowHHMM(),
        horas: 0.5,
        op: processoAlvo ? processoAlvo.id : "—",
        ok,
      };

      const operacoes = [novaOperacao, ...state.operacoes];

      const aeronaves = state.aeronaves.map((a) =>
        a.serie === aeronaveSerie
          ? {
              ...a,
              progresso: Math.min(100, a.progresso + (ok ? 2 : 1)),
              status: ok ? a.status : "atencao",
            }
          : a
      );

      const operadores = state.operadores.map((o) =>
        o.nome === operador ? { ...o, horasNoMes: +(o.horasNoMes + novaOperacao.horas).toFixed(1) } : o
      );

      const processos = processoAlvo
        ? state.processos.map((p) =>
            p.id === processoAlvo.id
              ? { ...p, horasRealizadas: +(p.horasRealizadas + novaOperacao.horas).toFixed(1) }
              : p
          )
        : state.processos;

      let naoConformidades = state.naoConformidades;
      let novaNC = null;
      if (!ok) {
        novaNC = {
          id: `NC-${String(Math.floor(1000 + Math.random() * 9000))}`,
          desc: `Torque fora da faixa (${novaOperacao.aplicado} Nm, especificado ${novaOperacao.spec} Nm) — ${ponto.label}`,
          sev: Math.abs(numero - (numero < ponto.min ? ponto.min : ponto.max)) > (ponto.max - ponto.min) * 0.3 ? "alta" : "media",
          os: `OS-${String(Math.floor(10000 + Math.random() * 90000))}`,
          status: "aberta",
          criadaEm: nowHHMM(),
        };
        naoConformidades = [novaNC, ...state.naoConformidades];
      }

      return { ...state, operacoes, aeronaves, operadores, processos, naoConformidades, _ultimoRegistro: { ok, novaNC } };
    }

    case "RESOLVER_NC": {
      const naoConformidades = state.naoConformidades.map((nc) =>
        nc.id === action.payload.id ? { ...nc, status: nc.status === "aberta" ? "resolvida" : "aberta" } : nc
      );
      return { ...state, naoConformidades };
    }

    case "RENOVAR_FERRAMENTA": {
      const ferramentas = state.ferramentas.map((f) =>
        f.id === action.payload.id ? { ...f, dias: 90, venc: "renovada" } : f
      );
      return { ...state, ferramentas };
    }

    case "RESET": {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      return {
        aeronaves: seedAeronaves,
        operacoes: seedOperacoes,
        operadores: seedOperadores,
        processos: seedProcessos,
        naoConformidades: seedNaoConformidades,
        ferramentas: seedFerramentas,
      };
    }

    default:
      return state;
  }
}

const RastroStateContext = createContext(null);
const RastroDispatchContext = createContext(null);

export function RastroProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // armazenamento indisponível (modo privado, quota) — segue só em memória
    }
  }, [state]);

  return (
    <RastroStateContext.Provider value={state}>
      <RastroDispatchContext.Provider value={dispatch}>{children}</RastroDispatchContext.Provider>
    </RastroStateContext.Provider>
  );
}

export function useRastroState() {
  const ctx = useContext(RastroStateContext);
  if (!ctx) throw new Error("useRastroState precisa estar dentro de <RastroProvider>");
  return ctx;
}

export function useRastroDispatch() {
  const ctx = useContext(RastroDispatchContext);
  if (!ctx) throw new Error("useRastroDispatch precisa estar dentro de <RastroProvider>");
  return ctx;
}

export { pontos };
