export default function Scratchpad({ scratch, setScratch, msg, setMsg, onClear }) {
  return (
    <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
      <div className="cdu-label" style={{ marginBottom: 5 }}>SCRATCHPAD</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="scratch-input focus-ring"
          value={scratch}
          onChange={(e) => { setScratch(e.target.value); setMsg(""); }}
          placeholder={msg || "digite um valor, depois toque no LSK do campo"}
          style={{ color: msg ? "var(--red)" : "var(--white)" }}
        />
        <button type="button" className="lsk-btn focus-ring" style={{ width: 44 }} onClick={onClear}>CLR</button>
      </div>
    </div>
  );
}
