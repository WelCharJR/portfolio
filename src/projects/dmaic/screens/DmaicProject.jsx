import { useState } from "react";
import StepButton from "../components/StepButton.jsx";
import DefinePanel from "../panels/DefinePanel.jsx";
import MeasurePanel from "../panels/MeasurePanel.jsx";
import AnalyzePanel from "../panels/AnalyzePanel.jsx";
import ImprovePanel from "../panels/ImprovePanel.jsx";
import ControlPanel from "../panels/ControlPanel.jsx";
import { STEPS } from "../constants.js";

const PANELS = {
  define: DefinePanel,
  measure: MeasurePanel,
  analyze: AnalyzePanel,
  improve: ImprovePanel,
  control: ControlPanel,
};

export default function DmaicProject() {
  const [step, setStep] = useState("define");
  const Panel = PANELS[step];
  const idx = STEPS.findIndex((s) => s.id === step);

  return (
    <div style={{ padding: "26px 20px 40px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <span className="display" style={{ fontSize: 19, fontWeight: 700 }}>DMAIC — Green Belt</span>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 2 }}>
            projeto: redução de não conformidade de torque — Junção de Asa, MSN 7734
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
          {STEPS.map((s) => (
            <StepButton key={s.id} step={s} active={s.id === step} onClick={() => setStep(s.id)} />
          ))}
        </div>

        <Panel />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
          <button
            type="button"
            className="focus-ring"
            disabled={idx === 0}
            onClick={() => setStep(STEPS[idx - 1].id)}
            style={{ background: "none", border: "1px solid var(--line)", borderRadius: 5, padding: "9px 14px", fontSize: 13, cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.4 : 1 }}
          >
            ← fase anterior
          </button>
          <button
            type="button"
            className="focus-ring"
            disabled={idx === STEPS.length - 1}
            onClick={() => setStep(STEPS[idx + 1].id)}
            style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 5, padding: "9px 16px", fontSize: 13, cursor: idx === STEPS.length - 1 ? "not-allowed" : "pointer", opacity: idx === STEPS.length - 1 ? 0.4 : 1 }}
          >
            próxima fase →
          </button>
        </div>
      </div>
    </div>
  );
}
