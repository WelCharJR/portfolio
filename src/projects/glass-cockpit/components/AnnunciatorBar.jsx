import { CX } from "../constants.js";

const MODES = ["AP", "ALT", "HDG", "IAS"];

export default function AnnunciatorBar({ mode, captured }) {
  return (
    <g>
      {MODES.map((m, i) => {
        const lit = m === "AP" ? mode === "auto" : mode === "auto" && captured[m];
        return (
          <g key={m}>
            <rect x={CX - 150 + i * 78} y={8} width="70" height="24" rx="3" fill="var(--bezel)" stroke={lit ? "var(--green)" : "#2a2d30"} strokeWidth="1.3" />
            <text x={CX - 150 + i * 78 + 35} y={24} textAnchor="middle" fill={lit ? "var(--green)" : "var(--dim)"} fontSize="12" fontWeight="600" className="mono">{m}</text>
          </g>
        );
      })}
    </g>
  );
}
