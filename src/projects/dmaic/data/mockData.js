export const baseline = [9.4, 8.8, 9.1, 8.3, 8.6, 7.9, 8.4, 8.9, 8.1, 8.5, 8.2, 8.4];

export const ncTypes = [
  { causa: "Torque acima do limite superior", qtd: 34 },
  { causa: "Ferramenta fora de calibração", qtd: 19 },
  { causa: "Leitura incorreta da escala", qtd: 12 },
  { causa: "Posicionamento incorreto do ponto", qtd: 7 },
  { causa: "Sequência de aperto não seguida", qtd: 4 },
];

export const fishbone = {
  "Método": ["Sequência de torque não padronizada", "Falta de dupla verificação"],
  "Máquina": ["Chaves dinamométricas com calibração vencida"],
  "Mão de obra": ["Treinamento insuficiente em leitura de escala"],
  "Material": ["Lote de parafusos fora da especificação de atrito"],
  "Medição": ["Instrumento sem rastreabilidade metrológica"],
  "Meio ambiente": ["Ruído/vibração na estação dificultando a leitura"],
};

export const fiveWhys = [
  "Por que o torque aplicado passa do limite? Operador não confia no clique da chave.",
  "Por que não confia no clique? A chave tem histórico de descalibrar rápido.",
  "Por que descalibra rápido? É usada acima da frequência recomendada sem manutenção preventiva.",
  "Por que não há intervalo definido? Não existe plano de calibração preventiva, só corretiva.",
  "Por que só corretiva? Falta um processo formal de gestão do parque de instrumentos de medição.",
];

export const actionPlan = [
  { causa: "Falta de calibração preventiva", acao: "Calendário de calibração preventiva a cada 30 dias", resp: "Metrologia", prazo: "15 dias", status: "concluído" },
  { causa: "Leitura de escala", acao: "Treinamento prático + certificação de leitura de torque", resp: "Qualidade", prazo: "20 dias", status: "concluído" },
  { causa: "Sequência não padronizada", acao: "Padronizar sequência de aperto na instrução de trabalho", resp: "Engenharia", prazo: "10 dias", status: "em andamento" },
];

export const controlWeeks = [2.4, 2.1, 1.8, 2.3, 1.9, 2.0, 1.7, 2.2];

export const controlPlan = [
  { item: "Taxa de NC de torque", frequencia: "semanal", resp: "Qualidade", reacao: "abrir RCA se > UCL por 2 semanas seguidas" },
  { item: "Calibração das chaves", frequencia: "mensal", resp: "Metrologia", reacao: "retirar de uso instrumento vencido" },
  { item: "Certificação de leitura", frequencia: "anual", resp: "Treinamento", reacao: "recertificar operador reprovado" },
];

// Amostra de torque aplicado (Nm), usada no histograma da fase Measure.
export const torqueSamples = [26.1, 27.3, 28.0, 29.4, 30.2, 27.8, 26.5, 28.9, 31.1, 29.0, 27.2, 28.4, 30.6, 26.8, 29.7, 28.1, 30.9, 27.5, 29.2, 28.6, 31.4, 26.9, 28.3, 29.9, 27.0, 30.4, 28.8, 29.5, 26.4, 31.0, 28.2, 29.1, 27.6, 30.1, 28.7, 29.3, 26.7, 30.8, 28.5, 29.6];

export const fmea = [
  { modo: "Torque acima do limite", efeito: "Junta sobretensionada, risco de fadiga", causa: "Calibração vencida", s: 8, o: 6, d: 4 },
  { modo: "Torque abaixo do limite", efeito: "Junta frouxa, folga estrutural", causa: "Leitura incorreta da escala", s: 8, o: 3, d: 5 },
  { modo: "Sequência de aperto incorreta", efeito: "Distribuição de carga desigual", causa: "Falta de padronização", s: 6, o: 3, d: 6 },
]
  .map((r) => ({ ...r, npr: r.s * r.o * r.d }))
  .sort((a, b) => b.npr - a.npr);

export const licoesAprendidas = [
  "Instrução de trabalho atualizada com a sequência de aperto padronizada",
  "Calibração preventiva incorporada à rotina da metrologia — não depende mais de solicitação manual",
  "Treinamento de leitura de torque incluído no onboarding de novos operadores",
];

export const hypothesisGroups = [
  { label: "Calibração recente (<10d)", n: 220, rate: 3.1, color: "var(--blue)" },
  { label: "Calibração vencida (>20d)", n: 180, rate: 14.8, color: "var(--red)" },
];
