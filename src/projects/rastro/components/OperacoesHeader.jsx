export default function OperacoesHeader() {
  return (
    <div
      className="mono"
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 0.8fr 0.9fr 1fr 0.7fr 0.6fr",
        gap: 12,
        padding: "6px 14px",
        fontSize: 10.5,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      <span>ponto</span>
      <span>especificado</span>
      <span>aplicado</span>
      <span>ferramenta</span>
      <span>operador</span>
      <span>hora</span>
      <span></span>
    </div>
  );
}
