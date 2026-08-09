export default function CalloutBanner({ text, tone }) {
  if (!text) return null;
  const color = tone === "bad" ? "var(--red)" : tone === "warn" ? "var(--amber)" : "var(--green)";
  return (
    <div
      key={text}
      className="callout mono"
      style={{
        position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)",
        fontSize: 24, fontWeight: 700, color, letterSpacing: "0.05em",
        textShadow: `0 0 14px ${color}`, pointerEvents: "none", whiteSpace: "nowrap", textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}
