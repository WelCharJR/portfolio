export default function FieldRow({ side, lsk, label, value, unit, onCommit, computed }) {
  const valueBlock = (
    <div style={{ flex: 1 }}>
      <div className="cdu-label">{label}</div>
      <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: computed ? "var(--white)" : "var(--green)" }}>
        {value}{unit}
      </div>
    </div>
  );
  const btn = !computed && (
    <button type="button" className="lsk-btn focus-ring" onClick={onCommit}>{lsk}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      {side === "L" ? <>{btn}{valueBlock}</> : <>{valueBlock}{btn}</>}
    </div>
  );
}
