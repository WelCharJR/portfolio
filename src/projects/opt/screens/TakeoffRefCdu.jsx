import { Info } from "lucide-react";
import useTakeoffPerf from "../hooks/useTakeoffPerf.js";
import { AIRCRAFT } from "../constants.js";
import FieldRow from "../components/FieldRow.jsx";
import Scratchpad from "../components/Scratchpad.jsx";
import PageNav from "../components/PageNav.jsx";
import ResultsTable from "../components/ResultsTable.jsx";

export default function TakeoffRefCdu() {
  const {
    acft, acftId, selectAcft,
    weight, setWeight, runway, setRunway, elevation, setElevation, oat, setOat, wind, setWind, slope, setSlope,
    page, setPage,
    scratch, setScratch, msg, setMsg, commit, clearScratch,
    densAlt, results, recommended, allInsufficient,
  } = useTakeoffPerf();

  return (
    <div style={{ padding: "26px 20px 40px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 17, fontWeight: 600 }}>OPT — Performance de Decolagem</span>
          <span className="mono" style={{ fontSize: 10.5, color: "#7d8489" }}>simulado</span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", background: "#221c0f", border: "1px solid #4a3a12", borderRadius: 6, padding: "8px 12px", marginBottom: 16 }}>
          <Info size={13} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: "var(--amber)", lineHeight: 1.5 }}>
            Ferramenta educacional. Usa especificações públicas (MTOW, área de asa, empuxo) e fórmulas
            simplificadas de performance — não reflete dados certificados do AFM real. Não usar para despacho.
          </span>
        </div>

        <div className="cdu-frame">
          <div className="cdu-screen">
            <div className="cdu-label" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--cyan)" }}>TAKEOFF REF</span>
              <span>{page}/2</span>
            </div>

            {page === 1 && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div className="cdu-label">ACFT TYPE</div>
                  <select className="cdu-select focus-ring" value={acftId} onChange={(e) => selectAcft(e.target.value)} style={{ marginTop: 4 }}>
                    {AIRCRAFT.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <FieldRow side="L" lsk="1L" label="GROSS WEIGHT" value={weight.toFixed(0)} unit=" KG" onCommit={() => commit(setWeight, acft.minWeight, acft.mtow, 10)} />
                  <FieldRow side="R" lsk="1R" label="RWY LENGTH" value={runway.toFixed(0)} unit=" M" onCommit={() => commit(setRunway, 500, 5000, 10)} />
                  <FieldRow side="L" lsk="2L" label="ELEVATION" value={elevation.toFixed(0)} unit=" FT" onCommit={() => commit(setElevation, -500, 12000, 10)} />
                  <FieldRow side="R" lsk="2R" label="OAT" value={oat.toFixed(0)} unit=" °C" onCommit={() => commit(setOat, -40, 50, 1)} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--line)" }}>
                  <span className="cdu-label">DENSITY ALT</span>
                  <span className="mono" style={{ fontSize: 13, color: "var(--white)" }}>{densAlt.toFixed(0)} FT</span>
                </div>
              </>
            )}

            {page === 2 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px", marginBottom: 4 }}>
                  <FieldRow side="L" lsk="1L" label="WIND (HW+/TW-)" value={wind.toFixed(0)} unit=" KT" onCommit={() => commit(setWind, -20, 60, 1)} />
                  <FieldRow side="R" lsk="1R" label="RWY SLOPE" value={slope.toFixed(1)} unit=" %" onCommit={() => commit(setSlope, -3, 3, 0.1)} />
                </div>

                <ResultsTable results={results} recommended={recommended} allInsufficient={allInsufficient} />
              </>
            )}

            <Scratchpad scratch={scratch} setScratch={setScratch} msg={msg} setMsg={setMsg} onClear={clearScratch} />
            <PageNav page={page} setPage={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
