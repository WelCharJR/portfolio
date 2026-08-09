import { Target, ClipboardList, Search, TrendingDown, ShieldCheck } from "lucide-react";

export const STEPS = [
  { id: "define", letter: "D", label: "Define", icon: Target },
  { id: "measure", letter: "M", label: "Measure", icon: ClipboardList },
  { id: "analyze", letter: "A", label: "Analyze", icon: Search },
  { id: "improve", letter: "I", label: "Improve", icon: TrendingDown },
  { id: "control", letter: "C", label: "Control", icon: ShieldCheck },
];

// LIE/LSE = mesmo ponto de fixação (Longarina EF) usado como exemplo no projeto RASTRO.
export const LIE = 25.0;
export const LSE = 30.0;
