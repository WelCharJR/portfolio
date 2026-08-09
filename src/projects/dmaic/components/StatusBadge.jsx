export default function StatusBadge({ status }) {
  const ok = status === "concluído";
  return (
    <span className="pill" style={{ background: ok ? "var(--green-soft)" : "var(--amber-soft)", color: ok ? "var(--green)" : "var(--amber)" }}>
      {status}
    </span>
  );
}
