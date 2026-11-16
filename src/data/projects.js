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
  {
    slug: "dmaic",
    title: "DMAIC — Green Belt",
    tagline: "Case de melhoria contínua aplicando o ciclo DMAIC completo",
    summary:
      "Case study interativo (Define, Measure, Analyze, Improve, Control) sobre redução de não conformidade de torque — histograma com Cpk, Ishikawa, Pareto, teste de hipótese, FMEA e carta de controle, tudo navegável fase a fase.",
    tags: ["React", "Six Sigma", "qualidade"],
    stack: ["React", "SVG puro", "dados de um case de melhoria contínua"],
    highlights: [
      "Histograma da distribuição de torque com LIE/LSE sobrepostos, ligado ao Cpk do processo",
      "Teste de hipótese (z de duas proporções) validando estatisticamente a causa raiz encontrada no Ishikawa",
      "FMEA priorizando as ações por NPR, e carta de controle confirmando o processo estabilizado após a melhoria",
    ],
    year: "2026",
  },
  {
    slug: "weapons-display",
    title: "Weapons Display",
    tagline: "Radar tático com guiamento por navegação proporcional e alvo com IA",
    summary:
      "Simulador estilo treinador de armamento (Fox 1/2/3): radar PPI, travamento de alvo, guiamento em tempo real por navegação proporcional, e um alvo que reage sozinho — notch, chaff/flare e manobras defensivas, cada arma com seu próprio comportamento de detecção.",
    tags: ["React", "SVG", "simulação", "IA de jogo"],
    stack: ["React", "SVG puro", "navegação proporcional (loop de física)"],
    highlights: [
      "Guiamento real em tempo real (não caminho pré-calculado) — o míssil corrige a cada quadro a partir da taxa de variação da linha de visada",
      "Alvo com IA autônoma: detecta o lançamento (rápido contra radar, lento contra calor) e escolhe a defesa certa pra cada tipo de míssil",
      "Limite de buscador (gimbal) na horizontal e na vertical, alcance mínimo de armar, e arrasto induzido por curva forte — tudo consequência da física, não regras artificiais",
    ],
    year: "2026",
  },
  {
    slug: "opt",
    title: "OPT — Performance de Decolagem",
    tagline: "CDU simulado calculando V-speeds e flap recomendado pra decolagem",
    summary:
      "Onboard Performance Tool simulado, estilizado como um CDU/MCDU real (scratchpad + LSK, duas páginas): calcula V1/VR/V2, distância de decolagem, peso limitado pela pista e o flap recomendado, para 7 aeronaves reais.",
    tags: ["React", "performance de voo", "física"],
    stack: ["React", "especificações públicas de aeronaves", "fórmulas de performance"],
    highlights: [
      "Interação real de CDU: digita no scratchpad, confirma no LSK do campo — inclusive com aviso de INVALID ENTRY",
      "Peso máximo pela pista calculado por busca binária em cima da própria física (a fórmula não dá pra inverter direto)",
      "Recomenda sempre o menor flap que atende a pista — a mesma lógica real de melhor gradiente de subida",
    ],
    year: "2026",
  },
  {
    slug: "logistica",
    title: "Hangar Logístico",
    tagline: "Hangar 3D interativo para organizar kanbans e materiais aeronáuticos",
    summary: "Explore um hangar tridimensional, mova pontos logísticos e consulte os materiais guardados em cada kanban. O layout fica salvo localmente no navegador.",
    tags: ["React", "Three.js", "logística", "3D"],
    stack: ["React 18", "Three.js", "localStorage"],
    highlights: [
      "Hangar 3D com câmera orbital, zoom e pontos logísticos selecionáveis",
      "Kanbans arrastáveis com seus itens e quantidades",
      "Layout guardado localmente neste navegador, sem conta ou serviço externo",
    ],
    year: "2026",
  },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}
