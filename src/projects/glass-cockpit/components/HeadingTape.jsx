import { CX } from "../constants.js";
import { wrap360 } from "../utils/math.js";

export default function HeadingTape({ heading }) {
  const pxPerDeg = 6;
  const x = CX - 150, y = 356, w = 300, h = 42;
  const ticks = [];
  for (let d = -30; d <= 30; d += 5) {
    const val = wrap360(Math.round((heading + d) / 5) * 5);
    const px = CX + d * pxPerDeg + (heading - Math.round(heading / 5) * 5) * -pxPerDeg;
    if (px < x + 6 || px > x + w - 6) continue;
    ticks.push({ val, px, major: val % 10 === 0, cardinal: val % 90 === 0 });
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--tape-bg)" stroke="#2a2d30" strokeWidth="1" />
      <text x={x + w / 2} y={y - 8} textAnchor="middle" fill="var(--dim)" fontSize="12" className="mono">HDG</text>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={t.px} y1={y + h - 14} x2={t.px} y2={y + h} stroke={t.cardinal ? "var(--amber)" : "var(--white)"} strokeWidth={t.cardinal ? 2 : 1.3} />
          {t.major && (
            <text x={t.px} y={y + 16} textAnchor="middle" fill={t.cardinal ? "var(--amber)" : "var(--white)"} fontSize="12" fontWeight={t.cardinal ? "700" : "400"} className="mono">
              {t.val === 0 ? "N" : t.val === 90 ? "E" : t.val === 180 ? "S" : t.val === 270 ? "W" : String(t.val).padStart(3, "0")}
            </text>
          )}
        </g>
      ))}
      <polygon points={`${CX},${y} ${CX - 6},${y - 9} ${CX + 6},${y - 9}`} fill="var(--cyan)" />
      <rect x={CX - 22} y={y + h + 4} width="44" height="20" fill="var(--tape-bg)" stroke="var(--cyan)" strokeWidth="1.5" />
      <text x={CX} y={y + h + 18} textAnchor="middle" fill="var(--cyan)" fontSize="13" fontWeight="700" className="mono">{String(Math.round(heading)).padStart(3, "0")}</text>
    </g>
  );
}
