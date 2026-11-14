import { OPERACOES_GRID } from "./operacoesGrid.js";

export default function OperacoesHeader() {
  return (
    <div
      className="mono"
      style={{
        display: "grid",
        gridTemplateColumns: OPERACOES_GRID,
        gap: 10,
        padding: "6px 14px",
        fontSize: 10.5,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      <span>ponto · aeronave · data</span>
      <span>especificado</span>
      <span>aplicado</span>
      <span>ferramenta</span>
      <span>operador</span>
      <span>OP</span>
      <span>horas</span>
      <span>hora</span>
      <span></span>
    </div>
  );
}
