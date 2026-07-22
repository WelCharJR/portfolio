import { CY } from "../constants.js";
import { clamp } from "../utils/math.js";

const MARKS = [-2000, -1000, 0, 1000, 2000];

export default function VerticalSpeedIndicator({ vspeed }) {
  const top = CY - 150, height = 300;
  const x = 764, w = 34;
  const v = clamp(vspeed, -2000, 2000);
  const pxPerFpm = 150 / 2000;
  const barY = v >= 0 ? CY - v * pxPerFpm : CY;
  const barH = Math.abs(v) * pxPerFpm;
  return (
    <g>
      <rect x={x} y={top} width={w} height={height} fill="var(--tape-bg)" stroke="#2a2d30" strokeWidth="1" />
      <text x={x + w / 2} y={top - 10} textAnchor="middle" fill="var(--dim)" fontSize="12" className="mono">V/S</text>
      {MARKS.map((m) => {
        const y = CY - m * pxPerFpm;
        return (
          <g key={m}>
            <line x1={x} y1={y} x2={x + 7} y2={y} stroke="var(--dim)" strokeWidth="1" />
            <text x={x + w + 4} y={y + 3} fill="var(--dim)" fontSize="9" className="mono">{Math.abs(m) / 1000 || ""}</text>
          </g>
        );
      })}
      <rect x={x + 10} y={Math.min(barY, CY)} width={w - 20} height={Math.max(barH, 1)} fill={v >= 0 ? "var(--green)" : "var(--amber)"} />
      <line x1={x} y1={CY} x2={x + w} y2={CY} stroke="var(--white)" strokeWidth="1.5" />
    </g>
  );
}
