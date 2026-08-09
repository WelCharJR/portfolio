export default function Stat({ label, value, tone }) {
  const color = tone === "red" ? "var(--red)" : tone === "green" ? "var(--green)" : "var(--ink)";
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", textTransform: "uppercase" }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
