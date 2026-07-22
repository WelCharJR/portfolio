import { CY } from "../constants.js";

export default function AltitudeTape({ altitude }) {
  const pxPerFt = 0.3;
  const top = CY - 150, height = 300;
  const ticks = [];
  for (let v = Math.ceil((altitude - 500) / 100) * 100; v <= altitude + 500; v += 100) {
    const y = CY - (v - altitude) * pxPerFt;
    if (y < top || y > top + height) continue;
    ticks.push({ v, y });
  }
  const x = 660, w = 96;
  return (
    <g>
      <rect x={x} y={top} width={w} height={height} fill="var(--tape-bg)" stroke="#2a2d30" strokeWidth="1" />
      <text x={x + w / 2} y={top - 10} textAnchor="middle" fill="var(--dim)" fontSize="12" className="mono">ALT</text>
      {ticks.map(({ v, y }) => (
        <g key={v}>
          <line x1={x} y1={y} x2={x + 12} y2={y} stroke="var(--white)" strokeWidth="1.5" />
          <text x={x + 18} y={y + 4} textAnchor="start" fill="var(--white)" fontSize="13" className="mono">{v}</text>
        </g>
      ))}
      <polygon points={`${x},${CY - 14} ${x - 14},${CY} ${x},${CY + 14} ${x + 26},${CY + 14} ${x + 26},${CY - 14}`} fill="var(--tape-bg)" stroke="var(--cyan)" strokeWidth="1.5" />
      <text x={x + 8} y={CY + 5} textAnchor="start" fill="var(--cyan)" fontSize="16" fontWeight="700" className="mono">{Math.round(altitude)}</text>
    </g>
  );
}
