export const aeronaves = [
  { serie: "E195-E2 · MSN 7734", estacao: "Junção de Asa — Bay 4", progresso: 78, status: "ok" },
  { serie: "E195-E2 · MSN 7735", estacao: "Fuselagem Central", progresso: 34, status: "atencao" },
  { serie: "E175 · MSN 5521", estacao: "Instalação de Cablagem", progresso: 92, status: "ok" },
  { serie: "E175 · MSN 5522", estacao: "Montagem Final", progresso: 12, status: "ok" },
];

export const pontos = [
  { id: "p1", label: "Longarina EF — P.12A", min: 25.0, max: 30.0 },
  { id: "p2", label: "Nervura 6 — P.03B", min: 18.0, max: 22.0 },
  { id: "p3", label: "Skin Panel — P.44", min: 12.0, max: 15.0 },
  { id: "p4", label: "Trem de Pouso — P.02", min: 80.0, max: 95.0 },
];

export const operacoes = [
  { ponto: "Longarina EF — P.12A", spec: "25.0–30.0", aplicado: "27.4", ferramenta: "CD-0231", operador: "M. Andrade", hora: "14:02", ok: true },
  { ponto: "Nervura 6 — P.03B", spec: "18.0–22.0", aplicado: "23.6", ferramenta: "CD-0114", operador: "R. Nolasco", hora: "13:47", ok: false },
  { ponto: "Skin Panel — P.44", spec: "12.0–15.0", aplicado: "13.2", ferramenta: "CD-0231", operador: "M. Andrade", hora: "13:31", ok: true },
  { ponto: "Trem de Pouso — P.02", spec: "80.0–95.0", aplicado: "88.0", ferramenta: "CD-0087", operador: "W. Camargo", hora: "13:15", ok: true },
];

export const naoConformidades = [
  { id: "NC-0442", desc: "Torque acima do limite superior — Nervura 6", sev: "alta", os: "OS-88213" },
  { id: "NC-0441", desc: "Ferramenta sem etiqueta de calibração visível", sev: "media", os: "OS-88190" },
];

export const ferramentas = [
  { id: "CD-0114", tipo: "Chave dinamométrica 5–25 Nm", venc: "22/07/2026", dias: 2 },
  { id: "CD-0356", tipo: "Chave dinamométrica 20–100 Nm", venc: "25/07/2026", dias: 5 },
];
