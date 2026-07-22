export const projects = [
  {
    slug: "rastro",
    title: "RASTRO",
    tagline: "Controle de qualidade e rastreabilidade de montagem aeronáutica",
    summary:
      "Painel de produção e formulário de registro de torque para uma linha de montagem, com verificação automática de conformidade e abertura de não conformidades.",
    tags: ["React", "controle de qualidade", "chão de fábrica"],
    stack: ["React", "CSS custom properties", "IBM Plex + Space Grotesk"],
    highlights: [
      "Verificação automática de conformidade a partir da faixa de torque especificada por ponto de fixação",
      "Formulário pensado pra uso em celular/tablet no chão de fábrica, com poucos toques",
      "Identidade visual baseada nas etiquetas amarelas de peça aeronáutica",
    ],
    year: "2026",
  },
  {
    slug: "glass-cockpit",
    title: "Glass Cockpit",
    tagline: "Primary Flight Display simulado, com física e piloto automático",
    summary:
      "Painel de voo com horizonte artificial, fitas de velocidade/altitude/proa, piloto automático com painel MCP, controles manuais por manche/manete e teclado, turbulência e avisos de envelope de voo.",
    tags: ["React", "SVG", "simulação"],
    stack: ["React", "SVG puro", "loop de física em requestAnimationFrame"],
    highlights: [
      "Física com inércia: atitude, curva e razão de subida respondem com amortecimento, não instantaneamente",
      "Piloto automático que persegue alvos de proa/altitude/velocidade definidos no MCP",
      "Registrador de voo com histórico dos últimos 60s",
    ],
    year: "2026",
  },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}
