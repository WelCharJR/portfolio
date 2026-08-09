export default function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{k}</span>
      <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>{v}</span>
    </div>
  );
}
