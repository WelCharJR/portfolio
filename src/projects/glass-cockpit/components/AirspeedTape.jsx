import { CY, OVERSPEED, STALL_SPEED } from "../constants.js";

export default function AirspeedTape({ speed }) {
  const pxPerKt = 4;
  const top = CY - 150, height = 300;
  const ticks = [];
  for (let v = Math.ceil((speed - 50) / 10) * 10; v <= speed + 50; v += 10) {
    if (v < 0) continue;
    const y = CY - (v - speed) * pxPerKt;
    if (y < top || y > top + height) continue;
    ticks.push({ v, y });
  }
  const x = 40, w = 96;
  return (
    <g>
      <rect x={x} y={top} width={w} height={height} fill="var(--tape-bg)" stroke="#2a2d30" strokeWidth="1" />
      <text x={x + w / 2} y={top - 10} textAnchor="middle" fill="var(--dim)" fontSize="12" className="mono">IAS</text>
      {ticks.map(({ v, y }) => {
        const unsafe = v < STALL_SPEED || v > OVERSPEED;
        return (
          <g key={v}>
            <line x1={x + w - 12} y1={y} x2={x + w} y2={y} stroke={unsafe ? "var(--red)" : "var(--white)"} strokeWidth="1.5" />
            <text x={x + w - 18} y={y + 4} textAnchor="end" fill={unsafe ? "var(--red)" : "var(--white)"} fontSize="13" className="mono">{v}</text>
          </g>
        );
      })}
      <polygon points={`${x + w},${CY - 14} ${x + w + 14},${CY} ${x + w},${CY + 14} ${x + w - 26},${CY + 14} ${x + w - 26},${CY - 14}`} fill="var(--tape-bg)" stroke="var(--cyan)" strokeWidth="1.5" />
      <text x={x + w - 8} y={CY + 5} textAnchor="end" fill="var(--cyan)" fontSize="16" fontWeight="700" className="mono">{Math.round(speed)}</text>
    </g>
  );
}
