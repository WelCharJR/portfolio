import { useMemo } from "react";
import { Radar, Crosshair, RotateCcw, Info } from "lucide-react";
import useEngagement from "../hooks/useEngagement.js";
import { WEAPONS, NM } from "../constants.js";
import { aspectLabel } from "../utils/math.js";
import SetupSlider from "../components/SetupSlider.jsx";
import Row from "../components/Row.jsx";
import Scope from "../components/Scope.jsx";

export default function WeaponsDisplay() {
  const eng = useEngagement();
  const {
    phase, weapon, setWeapon,
    tRange, setTRange, tBearing, setTBearing, tHeading, setTHeading, tSpeed, setTSpeed, tAlt, setTAlt,
    render, callout, log, chaffLeft, flareLeft, result,
    startLock, launch, reset,
  } = eng;

  const aspect = useMemo(() => {
    const relBearing = ((tBearing + 180 - tHeading) % 360 + 360) % 360;
    const angle = relBearing > 180 ? 360 - relBearing : relBearing;
    return { angle, label: aspectLabel(angle) };
  }, [tBearing, tHeading]);

  const w = WEAPONS[weapon];
  const belowRmin = tRange * NM < w.rminNm * NM;

  return (
    <div style={{ padding: "24px 20px 40px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span className="display" style={{ fontSize: 18, fontWeight: 700, color: "var(--green)" }}>WEAPONS DISPLAY</span>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--dim)" }}>simulado · alvo com IA autônoma</span>
        </div>
        <div style={{ display: "flex", gap: 6, background: "#120e05", border: "1px solid #4a3a12", borderRadius: 6, padding: "7px 11px", marginBottom: 14 }}>
          <Info size={12} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--amber)", lineHeight: 1.5 }}>
            Simulação estilo jogo/treinador — guiamento por navegação proporcional (conceito público de
            teoria de controle). Não reflete sistemas de armas reais.
          </span>
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 8, textTransform: "uppercase" }}>Cenário do alvo</div>
              <SetupSlider label="ALCANCE" value={tRange} min={1} max={38} step={0.5} unit=" NM" disabled={phase !== "setup"} onChange={setTRange} />
              <SetupSlider label="MARCAÇÃO" value={tBearing} min={0} max={359} step={1} unit="°" disabled={phase !== "setup"} onChange={setTBearing} />
              <SetupSlider label="PROA DO ALVO" value={tHeading} min={0} max={359} step={1} unit="°" disabled={phase !== "setup"} onChange={setTHeading} />
              <SetupSlider label="VELOCIDADE" value={tSpeed} min={200} max={650} step={10} unit=" KT" disabled={phase !== "setup"} onChange={setTSpeed} />
              <SetupSlider label="ALTITUDE" value={tAlt} min={5000} max={45000} step={500} unit=" FT" disabled={phase !== "setup"} onChange={setTAlt} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--dim)" }}>ASPECTO</span>
                <span className="mono" style={{ fontSize: 12, color: aspect.label === "HOT" ? "var(--red)" : aspect.label === "COLD" ? "var(--cyan)" : "var(--amber)" }}>
                  {aspect.label} ({aspect.angle.toFixed(0)}°)
                </span>
              </div>
            </div>

            <div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 8, textTransform: "uppercase" }}>Armamento</div>
              <div style={{ display: "flex", gap: 6 }}>
                {Object.entries(WEAPONS).map(([id, ww]) => (
                  <button key={id} type="button" disabled={phase === "flight" || phase === "result"} className={`wpn-btn focus-ring ${weapon === id ? "active" : ""}`} onClick={() => setWeapon(id)} style={{ flex: 1 }}>
                    {ww.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 6 }}>{w.name} · Rmax ~{w.rmaxNm}nm · Rmin ~{w.rminNm}nm</div>
              {phase === "setup" && belowRmin && (
                <div style={{ fontSize: 10.5, color: "var(--amber)", marginTop: 4 }}>⚠ alcance abaixo do mínimo de armar</div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phase === "setup" && (
                <button type="button" className="wpn-btn focus-ring" onClick={startLock}><Radar size={13} /> TRAVAR ALVO</button>
              )}
              {phase === "locking" && (
                <button type="button" className="wpn-btn focus-ring" disabled><Radar size={13} /> ADQUIRINDO...</button>
              )}
              {phase === "locked" && (
                <button type="button" className="wpn-btn launch focus-ring" onClick={launch}><Crosshair size={13} /> LANÇAR</button>
              )}
              {phase === "result" && (
                <button type="button" className="wpn-btn focus-ring" onClick={reset}><RotateCcw size={13} /> NOVO ENGAJAMENTO</button>
              )}
            </div>

            {render && (phase === "flight" || phase === "result") && (
              <div style={{ border: "1px solid var(--line)", borderRadius: 5, padding: "10px 12px" }}>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 6 }}>MÍSSIL</div>
                <Row k="FASE" v={render.phaseLabel} />
                <Row k="ALCANCE" v={`${(render.range / NM).toFixed(1)} NM`} />
                <Row k="TTI" v={`${render.tti.toFixed(0)} S`} />
                <Row k="VEL" v={`MACH ${(render.speedNow / 340).toFixed(1)}`} />
                <Row k="ARMADO" v={render.armed ? "SIM" : "NÃO"} />
                <div className="mono" style={{ fontSize: 10.5, color: "var(--dim)", margin: "8px 0 6px" }}>ALVO</div>
                <Row k="ALT" v={`${render.targetAlt.toFixed(0)} FT`} />
                <Row k="V/S" v={`${render.targetVS.toFixed(0)} FPM`} />
                <Row k="CHAFF" v={chaffLeft} />
                <Row k="FLARE" v={flareLeft} />
              </div>
            )}
          </div>

          <Scope phase={phase} weapon={weapon} tRange={tRange} tBearing={tBearing} tHeading={tHeading} render={render} callout={callout} result={result} />
        </div>

        {log.length > 0 && (
          <div className="mono" style={{ marginTop: 14, fontSize: 11, color: "var(--dim)", display: "flex", flexDirection: "column", gap: 3 }}>
            {log.map((l, i) => <span key={i}>› {l}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
