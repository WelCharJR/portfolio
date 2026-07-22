import { Power, RotateCcw } from "lucide-react";
import useFlightSim from "../hooks/useFlightSim.js";
import { headingDiff } from "../utils/math.js";
import { OVERSPEED, STALL_SPEED } from "../constants.js";
import AttitudeIndicator from "../components/AttitudeIndicator.jsx";
import AirspeedTape from "../components/AirspeedTape.jsx";
import AltitudeTape from "../components/AltitudeTape.jsx";
import VerticalSpeedIndicator from "../components/VerticalSpeedIndicator.jsx";
import HeadingTape from "../components/HeadingTape.jsx";
import AnnunciatorBar from "../components/AnnunciatorBar.jsx";
import WarningBanner from "../components/WarningBanner.jsx";
import McpPanel from "../components/McpPanel.jsx";
import ManualControls from "../components/ManualControls.jsx";
import FlightRecorder from "../components/FlightRecorder.jsx";

export default function Cockpit() {
  const sim = useFlightSim();
  const { mode, setMode, flight, targets, setTarget, manual, setManualField, turbulence, setTurbulence, history, scenarioActive, runScenario, reset } = sim;

  const captured = {
    ALT: Math.abs(targets.altitude - flight.altitude) < 60,
    HDG: Math.abs(headingDiff(targets.heading, flight.heading)) < 2,
    IAS: Math.abs(targets.airspeed - flight.airspeed) < 3,
  };

  const stall = flight.airspeed < STALL_SPEED;
  const overspeed = flight.airspeed > OVERSPEED;
  const highBank = Math.abs(flight.roll) > 45;
  const warningText = stall
    ? "STALL — VELOCIDADE ABAIXO DO MÍNIMO"
    : overspeed
    ? "OVERSPEED — VELOCIDADE ACIMA DO LIMITE"
    : highBank
    ? "ÂNGULO DE BANCO EXCESSIVO"
    : null;

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "26px 20px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="display" style={{ fontSize: 19, fontWeight: 700 }}>Glass Cockpit — PFD</span>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 2 }}>primary flight display simulado</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={`ctrl-btn focus-ring ${mode === "auto" ? "active" : ""}`}
            onClick={() => setMode((m) => (m === "auto" ? "manual" : "auto"))}
          >
            <Power size={14} />
            {mode === "auto" ? "Piloto automático engajado" : "Engajar piloto automático"}
          </button>
          <button type="button" className="ctrl-btn focus-ring" onClick={reset}>
            <RotateCcw size={14} /> Reiniciar
          </button>
        </div>
      </div>

      <WarningBanner text={warningText} critical={stall || overspeed} />

      <svg viewBox="0 0 920 460" style={{ width: "100%", height: "auto", background: "var(--panel-bg)", borderRadius: 8, border: "1px solid #222528" }}>
        <AnnunciatorBar mode={mode} captured={captured} />
        <AttitudeIndicator pitch={flight.displayPitch} roll={flight.displayRoll} />
        <AirspeedTape speed={flight.airspeed} />
        <AltitudeTape altitude={flight.altitude} />
        <VerticalSpeedIndicator vspeed={flight.vspeed} />
        <HeadingTape heading={flight.heading} />
      </svg>

      <McpPanel targets={targets} setTarget={setTarget} scenarioActive={scenarioActive} runScenario={runScenario} />
      <ManualControls mode={mode} manual={manual} setManualField={setManualField} turbulence={turbulence} setTurbulence={setTurbulence} />
      <FlightRecorder history={history} />
    </div>
  );
}
