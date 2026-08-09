import { torqueSamples } from "../data/mockData.js";
import { LIE, LSE } from "../constants.js";

export default function Histogram() {
  const w = 560, h = 200, padL = 30, padB = 26, padT = 14;
  const binWidth = 1.0;
  const min = 24, max = 32;
  const bins = [];
  for (let b = min; b < max; b += binWidth) {
    const count = torqueSamples.filter((v) => v >= b && v < b + binWidth).length;
    bins.push({ b, count });
  }
  const maxCount = Math.max(...bins.map((b) => b.count));
  const bw = (w - padL - 10) / bins.length;
  const x = (i) => padL + i * bw;
  const y = (c) => padT + (1 - c / maxCount) * (h - padT - padB);
  const xSpec = (v) => padL + ((v - min) / (max - min)) * (w - padL - 10);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      {bins.map((bin, i) => {
        const outOfSpec = bin.b < LIE || bin.b + binWidth > LSE;
        return (
          <rect
            key={bin.b}
            x={x(i) + bw * 0.08}
            y={y(bin.count)}
            width={bw * 0.84}
            height={h - padB - y(bin.count)}
            fill={outOfSpec ? "var(--red)" : "var(--blue)"}
            opacity={outOfSpec ? 0.85 : 0.75}
          />
        );
      })}
      <line x1={xSpec(LIE)} y1={padT} x2={xSpec(LIE)} y2={h - padB} stroke="var(--ink)" strokeWidth="1.6" strokeDasharray="5 3" />
      <text x={xSpec(LIE)} y={padT - 3} textAnchor="middle" fontSize="9.5" fill="var(--ink)" className="mono">LIE {LIE}</text>
      <line x1={xSpec(LSE)} y1={padT} x2={xSpec(LSE)} y2={h - padB} stroke="var(--ink)" strokeWidth="1.6" strokeDasharray="5 3" />
      <text x={xSpec(LSE)} y={padT - 3} textAnchor="middle" fontSize="9.5" fill="var(--ink)" className="mono">LSE {LSE}</text>
      {bins.map((bin, i) => (
        <text key={bin.b} x={x(i) + bw / 2} y={h - 8} textAnchor="middle" fontSize="8.5" fill="var(--ink-faint)" className="mono">{bin.b.toFixed(0)}</text>
      ))}
    </svg>
  );
}
