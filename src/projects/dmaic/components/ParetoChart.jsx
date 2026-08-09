import { ncTypes } from "../data/mockData.js";

export default function ParetoChart() {
  const w = 560, h = 220, padL = 30, padR = 40, padB = 40, padT = 14;
  const total = ncTypes.reduce((a, b) => a + b.qtd, 0);
  let cum = 0;
  const rows = ncTypes.map((d) => {
    cum += d.qtd;
    return { ...d, cumPct: (cum / total) * 100 };
  });
  const maxQtd = ncTypes[0].qtd;
  const bw = (w - padL - padR) / rows.length;
  const barY = (v) => padT + (1 - v / maxQtd) * (h - padT - padB);
  const lineY = (p) => padT + (1 - p / 100) * (h - padT - padB);
  const linePath = rows.map((r, i) => `${i === 0 ? "M" : "L"}${(padL + i * bw + bw / 2).toFixed(1)},${lineY(r.cumPct).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <line x1={padL} y1={lineY(80)} x2={w - padR} y2={lineY(80)} stroke="var(--amber)" strokeWidth="1" strokeDasharray="3 3" />
      <text x={w - padR + 4} y={lineY(80) + 3} fontSize="9" fill="var(--amber)" className="mono">80%</text>
      {rows.map((r, i) => (
        <g key={r.causa}>
          <rect
            x={padL + i * bw + bw * 0.15}
            y={barY(r.qtd)}
            width={bw * 0.7}
            height={h - padB - barY(r.qtd)}
            fill={r.cumPct <= 82 ? "var(--red)" : "#d8dcd6"}
          />
          <text x={padL + i * bw + bw / 2} y={barY(r.qtd) - 5} textAnchor="middle" fontSize="10" fill="var(--ink)" className="mono">{r.qtd}</text>
        </g>
      ))}
      <path d={linePath} fill="none" stroke="var(--blue)" strokeWidth="1.6" />
      {rows.map((r, i) => (
        <circle key={r.causa} cx={padL + i * bw + bw / 2} cy={lineY(r.cumPct)} r="2.6" fill="var(--blue)" />
      ))}
      {rows.map((r, i) => (
        <text key={r.causa} x={padL + i * bw + bw / 2} y={h - 10} textAnchor="middle" fontSize="8.5" fill="var(--ink-faint)">
          {r.causa.split(" ").slice(0, 2).join(" ")}
        </text>
      ))}
    </svg>
  );
}
