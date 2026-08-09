import { baseline } from "../data/mockData.js";

export default function RunChart() {
  const w = 560, h = 200, padL = 34, padB = 24, padT = 14;
  const max = 11, min = 0;
  const target = 2;
  const avg = baseline.reduce((a, b) => a + b, 0) / baseline.length;
  const x = (i) => padL + (i / (baseline.length - 1)) * (w - padL - 10);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  const path = baseline.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      {[0, 2, 4, 6, 8, 10].map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={w - 6} y2={y(t)} stroke="#eef1ee" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--ink-faint)" className="mono">{t}%</text>
        </g>
      ))}
      <line x1={padL} y1={y(target)} x2={w - 6} y2={y(target)} stroke="var(--green)" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x={w - 8} y={y(target) - 5} textAnchor="end" fontSize="10" fill="var(--green)" className="mono">meta 2%</text>
      <line x1={padL} y1={y(avg)} x2={w - 6} y2={y(avg)} stroke="var(--blue)" strokeWidth="1.2" strokeDasharray="2 3" />
      <text x={padL + 4} y={y(avg) - 5} fontSize="10" fill="var(--blue)" className="mono">média {avg.toFixed(1)}%</text>
      <path d={path} fill="none" stroke="var(--red)" strokeWidth="2" />
      {baseline.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--red)" />
      ))}
      {baseline.map((v, i) => (
        <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="9" fill="var(--ink-faint)" className="mono">S{i + 1}</text>
      ))}
    </svg>
  );
}
