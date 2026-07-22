export default function WarningBanner({ text, critical }) {
  if (!text) return null;
  const color = critical ? "var(--red)" : "var(--amber)";
  return (
    <div
      className="pfd-warning mono"
      style={{
        background: critical ? "rgba(230,83,74,0.15)" : "rgba(242,180,0,0.15)",
        border: `1px solid ${color}`,
        color,
        borderRadius: 6,
        padding: "8px 14px",
        fontSize: 12.5,
        fontWeight: 700,
        marginBottom: 12,
        letterSpacing: "0.03em",
      }}
    >
      ⚠ {text}
    </div>
  );
}
