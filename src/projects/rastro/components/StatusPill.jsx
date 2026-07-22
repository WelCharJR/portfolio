const TONES = {
  amber: { color: "var(--amber)", bg: "rgba(242,169,0,0.08)" },
  red: { color: "var(--red)", bg: "rgba(212,87,74,0.08)" },
  neutral: { color: "var(--text-dim)", bg: "var(--panel)" },
};

export default function StatusPill({ icon: Icon, label, value, tone = "neutral" }) {
  const t = TONES[tone];
  return (
    <div
      className="mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        border: "1px solid var(--line)",
        borderRadius: 4,
        background: t.bg,
      }}
    >
      <Icon size={14} color={t.color} strokeWidth={2} />
      <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{label}</span>
      <span style={{ color: t.color, fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
