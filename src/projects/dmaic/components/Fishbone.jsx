import { fishbone } from "../data/mockData.js";

export default function Fishbone() {
  const w = 640, h = 260;
  const spineY = h / 2;
  const cats = Object.entries(fishbone);
  const top = cats.slice(0, 3);
  const bottom = cats.slice(3);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <line x1="20" y1={spineY} x2={w - 110} y2={spineY} stroke="var(--ink)" strokeWidth="2" />
      <polygon points={`${w - 110},${spineY - 26} ${w - 20},${spineY} ${w - 110},${spineY + 26}`} fill="var(--green-soft)" stroke="var(--green)" strokeWidth="1.5" />
      <text x={w - 68} y={spineY + 4} textAnchor="middle" fontSize="10.5" fill="var(--green)" fontWeight="700">Alta taxa de NC de torque</text>

      {top.map(([cat, causes], i) => {
        const bx = 90 + i * 165;
        return (
          <g key={cat}>
            <line x1={bx} y1={26} x2={bx + 90} y2={spineY} stroke="var(--ink-dim)" strokeWidth="1.4" />
            <text x={bx - 4} y={20} fontSize="10.5" fontWeight="700" fill="var(--ink)">{cat}</text>
            {causes.map((c, j) => (
              <text key={c} x={bx + 4} y={38 + j * 13} fontSize="8.5" fill="var(--ink-dim)">{c}</text>
            ))}
          </g>
        );
      })}
      {bottom.map(([cat, causes], i) => {
        const bx = 90 + i * 165;
        return (
          <g key={cat}>
            <line x1={bx} y1={h - 20} x2={bx + 90} y2={spineY} stroke="var(--ink-dim)" strokeWidth="1.4" />
            <text x={bx - 4} y={h - 6} fontSize="10.5" fontWeight="700" fill="var(--ink)">{cat}</text>
            {causes.map((c, j) => (
              <text key={c} x={bx + 4} y={h - 26 - j * 13} fontSize="8.5" fill="var(--ink-dim)">{c}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
