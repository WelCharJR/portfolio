export default function SetupSlider({ label, value, min, max, step, unit, disabled, onChange }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--dim)" }}>{label}</span>
        <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        className="wpn-slider focus-ring"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
