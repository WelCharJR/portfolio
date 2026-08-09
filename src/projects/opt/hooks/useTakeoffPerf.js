import { useMemo, useState } from "react";
import { AIRCRAFT } from "../constants.js";
import { densityAltitude, airDensity, computeFlap, solveFieldLimitWeight } from "../utils/performance.js";

export default function useTakeoffPerf() {
  const [acftId, setAcftId] = useState("e175");
  const acft = AIRCRAFT.find((a) => a.id === acftId);

  const [weight, setWeight] = useState(Math.round(acft.mtow * 0.9));
  const [runway, setRunway] = useState(2400);
  const [elevation, setElevation] = useState(700);
  const [oat, setOat] = useState(25);
  const [wind, setWind] = useState(0);
  const [slope, setSlope] = useState(0);
  const [page, setPage] = useState(1);
  const [scratch, setScratch] = useState("");
  const [msg, setMsg] = useState("");

  function selectAcft(id) {
    const next = AIRCRAFT.find((a) => a.id === id);
    setAcftId(id);
    setWeight(Math.round(Math.min(weight, next.mtow)));
  }

  function commit(setter, min, max, round = 1) {
    const val = parseFloat(scratch.replace(",", "."));
    if (scratch.trim() === "" || isNaN(val)) { setMsg("INVALID ENTRY"); return; }
    const clamped = Math.min(max, Math.max(min, val));
    setter(Math.round(clamped / round) * round);
    setScratch("");
    setMsg("");
  }

  function clearScratch() {
    setScratch("");
    setMsg("");
  }

  const densAlt = densityAltitude(elevation, oat);
  const rho = airDensity(densAlt);

  const results = useMemo(() => {
    return acft.flaps.map((f) => {
      const ctx = { weightKg: weight, wingArea: acft.wingArea, clmax: f.clmax, thrustSL: acft.thrustSL, rho, windKt: wind, slopePct: slope };
      const r = computeFlap(ctx);
      const limit = solveFieldLimitWeight({ ...ctx, mtow: acft.mtow, minWeight: acft.minWeight }, runway);
      return { ...f, ...r, ok: r.distance <= runway, limitWeight: limit.weight, limitNote: limit.note };
    });
  }, [acft, weight, rho, wind, slope, runway]);

  const feasible = results.filter((r) => r.ok);
  const recommended = feasible.length > 0 ? feasible[0] : results[results.length - 1];
  const allInsufficient = feasible.length === 0;

  return {
    acft, acftId, selectAcft,
    weight, setWeight, runway, setRunway, elevation, setElevation, oat, setOat, wind, setWind, slope, setSlope,
    page, setPage,
    scratch, setScratch, msg, setMsg, commit, clearScratch,
    densAlt, results, recommended, allInsufficient,
  };
}
