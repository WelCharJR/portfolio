import { LIE, LSE } from "../constants.js";
import { ArrowDown } from "lucide-react";

export default function CtqTree() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div className="ctq-box" style={{ width: "100%" }}>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-faint)" }}>VOZ DO CLIENTE</span>
        <div>"A asa não pode ter falha estrutural por junta mal apertada"</div>
      </div>
      <ArrowDown size={16} color="var(--ink-faint)" />
      <div className="ctq-box" style={{ width: "100%" }}>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-faint)" }}>DRIVER</span>
        <div>Torque aplicado dentro da especificação de projeto</div>
      </div>
      <ArrowDown size={16} color="var(--ink-faint)" />
      <div className="ctq-box" style={{ width: "100%", borderColor: "var(--green)", background: "var(--green-soft)" }}>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--green)" }}>CTQ (MÉTRICA)</span>
        <div style={{ fontWeight: 600 }}>100% das aplicações de torque entre {LIE} e {LSE} Nm (LIE/LSE)</div>
      </div>
    </div>
  );
}
