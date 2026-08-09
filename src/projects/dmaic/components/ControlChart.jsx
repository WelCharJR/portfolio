import { controlWeeks } from "../data/mockData.js";

export default function ControlChart() {
  const w = 560, h = 200, padL = 34, padB = 24, padT = 14;
  const cl = controlWeeks.reduce((a, b) => a + b, 0) / controlWeeks.length;
  const ucl = 4.1, lcl = 0;
  const max = 5;
  const x = (i) => padL + (i / (controlWeeks.length - 1)) * (w - padL - 10);
  const y = (v) => padT + (1 - v / max) * (h - padT - padB);
  const path = controlWeeks.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <rect x={padL} y={y(ucl)} width={w - padL - 10} height={y(lcl) - y(ucl)} fill="var(--green-soft)" opacity="0.6" />
      <line x1={padL} y1={y(ucl)} x2={w - 6} y2={y(ucl)} stroke="var(--red)" strokeWidth="1.3" strokeDasharray="4 4" />
      <text x={w - 8} y={y(ucl) - 4} textAnchor="end" fontSize="9.5" fill="var(--red)" className="mono">LSC {ucl.toFixed(1)}%</text>
      <line x1={padL} y1={y(cl)} x2={w - 6} y2={y(cl)} stroke="var(--ink-dim)" strokeWidth="1.2" strokeDasharray="2 3" />
      <text x={w - 8} y={y(cl) - 4} textAnchor="end" fontSize="9.5" fill="var(--ink-dim)" className="mono">LC {cl.toFixed(1)}%</text>
      <line x1={padL} y1={y(lcl)} x2={w - 6} y2={y(lcl)} stroke="var(--red)" strokeWidth="1.3" strokeDasharray="4 4" />
      <path d={path} fill="none" stroke="var(--green)" strokeWidth="2" />
      {controlWeeks.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--green)" />
      ))}
      {controlWeeks.map((v, i) => (
        <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="9" fill="var(--ink-faint)" className="mono">S{i + 1}</text>
      ))}
    </svg>
  );
}
