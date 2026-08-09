import { useEffect, useRef, useState } from "react";
import { WEAPONS, NM, KT, FT, HIT_RADIUS_M, MIN_MISSILE_SPEED, MAX_FLIGHT_TIME, OWNSHIP_ALT_FT } from "../constants.js";
import { v, vadd, vsub, vscale, vlen, vdot, vcross, deg2rad, rad2deg, normAngle, rand } from "../utils/math.js";

export default function useEngagement() {
  const [phase, setPhase] = useState("setup"); // setup | locking | locked | flight | result
  const [weapon, setWeapon] = useState("fox3");
  const [tRange, setTRange] = useState(22);
  const [tBearing, setTBearing] = useState(40);
  const [tHeading, setTHeading] = useState(230);
  const [tSpeed, setTSpeed] = useState(420);
  const [tAlt, setTAlt] = useState(25000);

  const [render, setRender] = useState(null);
  const [callout, setCallout] = useState(null);
  const [log, setLog] = useState([]);
  const [chaffLeft, setChaffLeft] = useState(2);
  const [flareLeft, setFlareLeft] = useState(2);
  const [result, setResult] = useState(null);

  const simRef = useRef(null);
  const rafRef = useRef(null);

  function pushLog(text) {
    setCallout(text);
    setLog((l) => [...l.slice(-6), text]);
  }

  function startLock() {
    setPhase("locking");
    setTimeout(() => setPhase("locked"), 1200);
  }

  function launch() {
    const w = WEAPONS[weapon];
    const bearingRad = deg2rad(tBearing);
    const headingRad = deg2rad(tHeading);
    const targetPos = v(Math.sin(bearingRad) * tRange * NM, Math.cos(bearingRad) * tRange * NM);
    const targetVel = v(Math.sin(headingRad) * tSpeed * KT, Math.cos(headingRad) * tSpeed * KT);
    const losRad = Math.atan2(targetPos.x, targetPos.y);
    const missileVel = v(Math.sin(losRad) * w.initSpeed, Math.cos(losRad) * w.initSpeed);

    simRef.current = {
      t: 0,
      targetPos, targetVel, targetHeadingRad: headingRad,
      targetAlt: tAlt, targetVS: 0, diveTimer: 0,
      turning: false, turnTargetRad: headingRad,
      missilePos: v(0, 0), missileVel,
      ballistic: false, decoyUntil: 0, decoyPoint: null,
      distanceTraveled: 0,
      phaseLabel: weapon === "fox3" ? "MIDCOURSE" : "BOOST",
      ai: { aware: false, reactionAt: rand(...w.reaction), primaryDone: false, lastResortDone: false },
      done: false,
    };
    setChaffLeft(2); setFlareLeft(2);
    setPhase("flight");
    pushLog(w.label + "!");
  }

  function applyCounter(s, type) {
    const range = vlen(vsub(s.targetPos, s.missilePos));
    const closingVel = -vdot(vsub(s.targetVel, s.missileVel), vsub(s.targetPos, s.missilePos)) / range;
    const tti = closingVel > 1 ? range / closingVel : 99;
    const chance = tti > 4 ? 0.55 : tti > 1.5 ? 0.3 : 0.08;
    const success = Math.random() < chance;
    const label = type === "chaff" ? "CHAFF" : "FLARE";
    if (success) {
      const perp = v(-Math.cos(s.targetHeadingRad), Math.sin(s.targetHeadingRad));
      s.decoyPoint = vadd(s.targetPos, vscale(perp, 500));
      s.decoyUntil = s.t + 2.2;
      pushLog(label + " EFICAZ — MÍSSIL DESVIADO");
    } else {
      pushLog(label + " SEM EFEITO — MÍSSIL MANTÉM RASTREIO");
    }
  }

  function startNotch(s) {
    const losToMissile = vsub(s.missilePos, s.targetPos);
    const losAngle = Math.atan2(losToMissile.x, losToMissile.y);
    const opt1 = losAngle + Math.PI / 2;
    const opt2 = losAngle - Math.PI / 2;
    const d1 = Math.abs(normAngle(opt1 - s.targetHeadingRad));
    const d2 = Math.abs(normAngle(opt2 - s.targetHeadingRad));
    s.turnTargetRad = d1 < d2 ? opt1 : opt2;
    s.turning = true;
  }

  function startBreakTurn(s) {
    s.turnTargetRad = s.targetHeadingRad + deg2rad(125);
    s.turning = true;
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    simRef.current = null;
    setPhase("setup");
    setResult(null);
    setCallout(null);
    setLog([]);
    setRender(null);
  }

  useEffect(() => {
    if (phase !== "flight") return;
    let last = performance.now();
    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = simRef.current;
      if (!s || s.done) return;
      const w = WEAPONS[weapon];
      s.t += dt;

      // ---- AI: target reacts on its own ----
      if (!s.ai.aware && s.t >= s.ai.reactionAt) {
        s.ai.aware = true;
        pushLog(weapon === "fox2" ? "ALVO: AVISO TARDIO (MAWS) — CALOR NÃO EMITE RF" : "ALVO: LANÇAMENTO DETECTADO (RWR)");
      }
      if (s.ai.aware && !s.ai.primaryDone) {
        s.ai.primaryDone = true;
        if (weapon === "fox1") {
          startNotch(s);
          pushLog("ALVO: EXECUTANDO NOTCH");
        } else if (weapon === "fox2") {
          if (flareLeft > 0) { setFlareLeft((c) => c - 1); applyCounter(s, "flare"); }
          startBreakTurn(s);
          pushLog("ALVO: FLARE + MANOBRA DEFENSIVA");
        } else {
          if (chaffLeft > 0) { setChaffLeft((c) => c - 1); applyCounter(s, "chaff"); }
          startBreakTurn(s);
          pushLog("ALVO: CHAFF + MANOBRA DEFENSIVA");
        }
      }
      if (s.ai.aware && s.ai.primaryDone && !s.ai.lastResortDone && !s.ballistic) {
        const range0 = vlen(vsub(s.targetPos, s.missilePos));
        const closingVel0 = -vdot(vsub(s.targetVel, s.missileVel), vsub(s.targetPos, s.missilePos)) / range0;
        const tti0 = closingVel0 > 1 ? range0 / closingVel0 : 99;
        if (tti0 < 4.5 && tti0 > 0) {
          s.ai.lastResortDone = true;
          startBreakTurn(s);
          s.targetVS = -6000;
          s.diveTimer = 5;
          pushLog("ALVO: MANOBRA DE ÚLTIMO RECURSO (BREAK + MERGULHO)");
        }
      }

      // ---- target kinematics ----
      if (s.turning) {
        const diff = normAngle(s.turnTargetRad - s.targetHeadingRad);
        const maxRate = (8 * 9.81) / (tSpeed * KT);
        const step = Math.sign(diff) * Math.min(Math.abs(diff), maxRate * dt);
        s.targetHeadingRad += step;
        if (Math.abs(diff) < 0.02) s.turning = false;
        s.targetVel = v(Math.sin(s.targetHeadingRad) * tSpeed * KT, Math.cos(s.targetHeadingRad) * tSpeed * KT);
      }
      if (s.targetVS !== 0) {
        s.diveTimer -= dt;
        s.targetAlt = Math.max(1000, s.targetAlt + (s.targetVS / 60) * dt);
        if (s.diveTimer <= 0) s.targetVS = 0;
      }
      s.targetPos = vadd(s.targetPos, vscale(s.targetVel, dt));

      // ---- notch geometry (azimuth beam) ----
      const losToMissileFromTarget = vsub(s.missilePos, s.targetPos);
      const losAngleFromTarget = Math.atan2(losToMissileFromTarget.x, losToMissileFromTarget.y);
      const offDeg = rad2deg(Math.abs(normAngle(s.targetHeadingRad - losAngleFromTarget)));
      const isNotching = Math.abs(offDeg - 90) < 20;
      if (isNotching && weapon === "fox1" && !s.ballistic) {
        s.notchTimer = (s.notchTimer || 0) + dt;
        if (s.notchTimer > 1.2) {
          s.ballistic = true;
          s.phaseLabel = "BALLISTIC";
          pushLog("NOTCH EFICAZ — RADAR PERDEU O ALVO NO DOPPLER");
        }
      } else {
        s.notchTimer = Math.max(0, (s.notchTimer || 0) - dt * 0.5);
      }

      const guideTarget = s.t < s.decoyUntil && s.decoyPoint ? s.decoyPoint : s.targetPos;
      const guideVel = s.t < s.decoyUntil && s.decoyPoint ? v(0, 0) : s.targetVel;

      if (!s.ballistic) {
        const R = vsub(guideTarget, s.missilePos);
        const range = vlen(R);
        const Vrel = vsub(guideVel, s.missileVel);
        const closingVel = -vdot(Vrel, R) / range;
        // vcross() gives d(angle)/dt in standard math convention; headings here are
        // compass bearings (clockwise-positive), so negate to get the correct sign.
        const losRate = -vcross(R, Vrel) / (range * range);
        let aCmd = w.N * closingVel * losRate;
        const maxA = w.maxG * 9.81;
        aCmd = Math.max(-maxA, Math.min(maxA, aCmd));

        const missileHeading = Math.atan2(s.missileVel.x, s.missileVel.y);
        const losAngle = Math.atan2(R.x, R.y);
        const angleOff = Math.abs(normAngle(losAngle - missileHeading));

        const altDiffM = (s.targetAlt - OWNSHIP_ALT_FT) * FT;
        const elevAngleDeg = Math.abs(rad2deg(Math.atan2(altDiffM, range)));

        if (rad2deg(angleOff) > w.gimbal || elevAngleDeg > w.elevGimbal) {
          s.ballistic = true;
          s.phaseLabel = "BALLISTIC";
          pushLog(elevAngleDeg > w.elevGimbal ? "MÍSSIL PERDEU O ALVO (NOTCH VERTICAL)" : "MÍSSIL PERDEU O ALVO (LIMITE DO BUSCADOR)");
        } else {
          let speed = vlen(s.missileVel);
          const turnRate = aCmd / Math.max(speed, 1);
          const newHeading = missileHeading + turnRate * dt;
          const baseDecel = s.t > w.boostTime ? w.decel : 0;
          const inducedDrag = Math.pow(Math.abs(aCmd) / maxA, 2) * 22;
          speed = Math.max(MIN_MISSILE_SPEED - 1, speed - (baseDecel + inducedDrag) * dt);
          s.missileVel = v(Math.sin(newHeading) * speed, Math.cos(newHeading) * speed);

          if (weapon === "fox3" && s.phaseLabel === "MIDCOURSE" && range < w.pitbullNm * NM) {
            s.phaseLabel = "PITBULL";
            pushLog("PITBULL");
          } else if (weapon !== "fox3" && s.phaseLabel === "BOOST" && s.t > w.boostTime) {
            s.phaseLabel = "CRUISE";
          }
        }
      }
      s.missilePos = vadd(s.missilePos, vscale(s.missileVel, dt));
      s.distanceTraveled += vlen(s.missileVel) * dt;

      const realRange = vlen(vsub(s.targetPos, s.missilePos));
      const speedNow = vlen(s.missileVel);
      const armed = s.distanceTraveled > w.rminNm * NM;

      let finished = null;
      if (realRange < HIT_RADIUS_M) finished = armed ? "hit" : "unarmed";
      else if (speedNow < MIN_MISSILE_SPEED) finished = "energy";
      else if (s.ballistic && s.t > 6 && realRange > 3000) finished = "defeated";
      else if (s.t > MAX_FLIGHT_TIME) finished = "timeout";

      if (finished) {
        s.done = true;
        setResult(finished);
        setPhase("result");
        if (finished === "hit") pushLog("SPLASH!");
        else if (finished === "unarmed") pushLog("MISS — ABAIXO DO ALCANCE MÍNIMO DE ARMAR");
        else if (finished === "energy") pushLog("MISS — SEM ENERGIA");
        else if (finished === "defeated") pushLog("MISS — DEFESA DO ALVO FUNCIONOU");
        else pushLog("MISS — TEMPO ESGOTADO");
      }

      setRender({
        targetPos: s.targetPos, missilePos: s.missilePos, missileVel: s.missileVel,
        phaseLabel: s.phaseLabel, range: realRange, tti: realRange / Math.max(speedNow, 1),
        speedNow, notching: isNotching, targetHeadingRad: s.targetHeadingRad,
        targetAlt: s.targetAlt, targetVS: s.targetVS, armed,
      });

      if (!finished) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return {
    phase, weapon, setWeapon,
    tRange, setTRange, tBearing, setTBearing, tHeading, setTHeading, tSpeed, setTSpeed, tAlt, setTAlt,
    render, callout, log, chaffLeft, flareLeft, result,
    startLock, launch, reset,
  };
}
