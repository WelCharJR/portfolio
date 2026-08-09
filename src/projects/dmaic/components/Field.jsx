export default function Field({ label, text, last, accent }) {
  return (
    <div style={{ marginBottom: last ? 0 : 14 }}>
      <div className="mono" style={{ fontSize: 10.5, color: accent ? "var(--green)" : "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}
