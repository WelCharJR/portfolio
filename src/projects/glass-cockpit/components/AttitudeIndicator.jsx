import { CX, CY, R, R_CLIP, PX_PER_DEG_PITCH } from "../constants.js";
import { deg2rad } from "../utils/math.js";

const PITCH_MARKS = [-30, -20, -10, 10, 20, 30];
const BANK_TICKS = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];

export default function AttitudeIndicator({ pitch, roll }) {
  return (
    <g>
      <defs>
        <clipPath id="adiClip"><circle cx={CX} cy={CY} r={R_CLIP} /></clipPath>
      </defs>
      <circle cx={CX} cy={CY} r={R + 10} fill="var(--bezel)" />
      <g clipPath="url(#adiClip)">
        <g transform={`rotate(${-roll} ${CX} ${CY})`}>
          <g transform={`translate(0 ${pitch * PX_PER_DEG_PITCH})`}>
            <rect x={CX - 400} y={CY - 900} width="800" height="900" fill="var(--sky)" />
            <rect x={CX - 400} y={CY} width="800" height="900" fill="var(--ground)" />
            <line x1={CX - 400} y1={CY} x2={CX + 400} y2={CY} stroke="var(--white)" strokeWidth="2" />
            {PITCH_MARKS.map((m) => {
              const y = CY - m * PX_PER_DEG_PITCH;
              const half = m % 20 === 0 ? 48 : 26;
              const dashed = m < 0;
              return (
                <g key={m}>
                  <line x1={CX - half} y1={y} x2={CX - 14} y2={y} stroke="var(--white)" strokeWidth="1.8" strokeDasharray={dashed ? "5 4" : "none"} />
                  <line x1={CX + 14} y1={y} x2={CX + half} y2={y} stroke="var(--white)" strokeWidth="1.8" strokeDasharray={dashed ? "5 4" : "none"} />
                  <text x={CX - half - 8} y={y + 4} textAnchor="end" fill="var(--white)" fontSize="11" className="mono">{Math.abs(m)}</text>
                  <text x={CX + half + 8} y={y + 4} textAnchor="start" fill="var(--white)" fontSize="11" className="mono">{Math.abs(m)}</text>
                </g>
              );
            })}
          </g>
          <polygon points={`${CX},${CY - R_CLIP + 14} ${CX - 7},${CY - R_CLIP + 28} ${CX + 7},${CY - R_CLIP + 28}`} fill="var(--white)" />
        </g>
      </g>
      <circle cx={CX} cy={CY} r={R_CLIP} fill="none" stroke="#2a2d30" strokeWidth="3" />
      {BANK_TICKS.map((t) => {
        const rad = deg2rad(t);
        const rOut = R + 6;
        const rIn = t % 30 === 0 ? R - 10 : R - 4;
        const x1 = CX + rOut * Math.sin(rad), y1 = CY - rOut * Math.cos(rad);
        const x2 = CX + rIn * Math.sin(rad), y2 = CY - rIn * Math.cos(rad);
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--white)" strokeWidth="2" />;
      })}
      <polygon points={`${CX},${CY - R + 4} ${CX - 6},${CY - R - 8} ${CX + 6},${CY - R - 8}`} fill="var(--amber)" />
      <line x1={CX - 62} y1={CY} x2={CX - 20} y2={CY} stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
      <line x1={CX + 20} y1={CY} x2={CX + 62} y2={CY} stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="4" fill="var(--amber)" />
    </g>
  );
}
