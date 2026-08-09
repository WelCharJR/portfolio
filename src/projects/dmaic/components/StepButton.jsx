export default function StepButton({ step, active, onClick }) {
  return (
    <button type="button" className={`step-btn focus-ring ${active ? "active" : ""}`} onClick={onClick}>
      <span className="mono step-letter" style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{step.letter}</span>
      <span className="step-label" style={{ fontSize: 13, color: "var(--ink)" }}>{step.label}</span>
    </button>
  );
}
