export default function Sparkline({ label, data, unit, color, decimals = 0 }) {
  const w = 288, h = 64, padY = 8;
  const has = data.length >= 2;
  const vals = data.map((d) => d.v);
  const min = has ? Math.min(...vals) : 0;
  const max = has ? Math.max(...vals) : 1;
  const range = max - min || 1;
  const path = has
    ? data
        .map((d, i) => {
          const px = (i / (data.length - 1)) * w;
          const py = h - padY - ((d.v - min) / range) * (h - 2 * padY);
          return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
        })
        .join(" ")
    : "";
  const current = has ? vals[vals.length - 1] : null;

  return (
    <div style={{ background: "var(--tape-bg)", border: "1px solid #2a2d30", borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
        <span className="mono" style={{ fontSize: 12, color }}>
          {current !== null ? current.toFixed(decimals) : "--"}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 48, display: "block" }}>
        {has ? (
          <path d={path} fill="none" stroke={color} strokeWidth="1.6" />
        ) : (
          <text x={w / 2} y={h / 2} textAnchor="middle" fill="var(--dim)" fontSize="10" className="mono">gravando...</text>
        )}
      </svg>
    </div>
  );
}
