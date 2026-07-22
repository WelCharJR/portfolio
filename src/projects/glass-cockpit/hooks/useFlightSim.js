import { useEffect, useRef, useState } from "react";
import { DEFAULT_FLIGHT, DEFAULT_MANUAL, DEFAULT_TARGETS } from "../constants.js";
import { clamp, headingDiff, wrap360 } from "../utils/math.js";

export default function useFlightSim() {
  const [mode, setMode] = useState("auto");
  const [flight, setFlight] = useState({ ...DEFAULT_FLIGHT, displayPitch: 0, displayRoll: 0 });
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [manual, setManual] = useState(DEFAULT_MANUAL);
  const [turbulence, setTurbulence] = useState(0);
  const [history, setHistory] = useState([]);
  const [scenarioActive, setScenarioActive] = useState(false);

  const flightRef = useRef({ ...DEFAULT_FLIGHT });
  const targetsRef = useRef(targets);
  const manualRef = useRef(manual);
  const modeRef = useRef(mode);
  const turbRef = useRef(0);
  const wobbleRef = useRef({ p: 0, r: 0 });
  const scenarioRef = useRef(null);
  const pressedRef = useRef(new Set());
  const rafRef = useRef(null);

  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { manualRef.current = manual; }, [manual]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { turbRef.current = turbulence; }, [turbulence]);

  // Keyboard: arrows drive the stick (pitch/roll), +/- drive the throttle. Manual mode only.
  useEffect(() => {
    function onDown(e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "+", "-", "="].includes(e.key)) e.preventDefault();
      pressedRef.current.add(e.key);
    }
    function onUp(e) { pressedRef.current.delete(e.key); }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Main physics loop — always running. Auto mode computes control targets from the
  // MCP/autopilot logic; manual mode reads them from the stick/throttle state.
  useEffect(() => {
    let last = performance.now();
    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const s = flightRef.current;
      const md = modeRef.current;

      if (md === "manual") {
        const keys = pressedRef.current;
        const mi = manualRef.current;
        let { pitch, roll, throttle } = mi;
        const rate = 14, tRate = 40;
        if (keys.has("ArrowUp")) pitch = clamp(pitch + rate * dt, -20, 20);
        if (keys.has("ArrowDown")) pitch = clamp(pitch - rate * dt, -20, 20);
        if (keys.has("ArrowLeft")) roll = clamp(roll - rate * 2.5 * dt, -45, 45);
        if (keys.has("ArrowRight")) roll = clamp(roll + rate * 2.5 * dt, -45, 45);
        if (keys.has("+") || keys.has("=")) throttle = clamp(throttle + tRate * dt, 100, 340);
        if (keys.has("-")) throttle = clamp(throttle - tRate * dt, 100, 340);
        if (pitch !== mi.pitch || roll !== mi.roll || throttle !== mi.throttle) {
          const next = { pitch, roll, throttle };
          manualRef.current = next;
          setManual(next);
        }
      }

      let rollInput, airspeedInput, pitchInputDirect = null;

      if (md === "auto") {
        const tg = { ...targetsRef.current };
        if (scenarioRef.current && scenarioRef.current.type === "turn360") {
          const rate = 22;
          tg.heading = wrap360(tg.heading + rate * dt);
          scenarioRef.current.accumulated += rate * dt;
          targetsRef.current = tg;
          setTargets(tg);
          if (scenarioRef.current.accumulated >= 360) {
            scenarioRef.current = null;
            setScenarioActive(false);
          }
        }
        const headErr = headingDiff(tg.heading, s.heading);
        rollInput = clamp(headErr * 2.2, -25, 25);
        airspeedInput = tg.airspeed;
      } else {
        const mi = manualRef.current;
        rollInput = mi.roll;
        pitchInputDirect = mi.pitch;
        airspeedInput = mi.throttle;
      }

      const roll = s.roll + (rollInput - s.roll) * (1 - Math.exp(-dt / 0.9));
      const heading = wrap360(s.heading + roll * 0.15 * dt);

      let pitch, vspeed;
      if (md === "auto") {
        const altErr = targetsRef.current.altitude - s.altitude;
        const vspeedTarget = clamp(altErr * 3, -1500, 1500);
        vspeed = s.vspeed + (vspeedTarget - s.vspeed) * (1 - Math.exp(-dt / 1.0));
        pitch = clamp((vspeed / 1500) * 9, -9, 9);
      } else {
        pitch = s.pitch + (pitchInputDirect - s.pitch) * (1 - Math.exp(-dt / 0.7));
        const vspeedTarget = pitch * 100;
        vspeed = s.vspeed + (vspeedTarget - s.vspeed) * (1 - Math.exp(-dt / 1.4));
      }

      const altitude = clamp(s.altitude + (vspeed / 60) * dt, 0, 40000);
      const airspeed = clamp(s.airspeed + clamp(airspeedInput - s.airspeed, -dt * 6, dt * 6), 40, 400);

      // Turbulence — cosmetic jitter layered on the displayed attitude only, physics stays clean.
      const amp = turbRef.current * 0.4;
      const w = wobbleRef.current;
      w.p = w.p * Math.exp(-dt / 0.35) + (Math.random() - 0.5) * amp * 2.4 * dt;
      w.r = w.r * Math.exp(-dt / 0.35) + (Math.random() - 0.5) * amp * 2.4 * dt;

      const pure = { pitch, roll, heading, airspeed, altitude, vspeed };
      flightRef.current = pure;
      setFlight({ ...pure, displayPitch: pitch + w.p, displayRoll: roll + w.r });

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Flight data recorder — samples the pure flight state twice a second, independent of mode.
  useEffect(() => {
    const id = setInterval(() => {
      const s = flightRef.current;
      setHistory((h) => {
        const next = [...h, { t: Date.now(), altitude: s.altitude, airspeed: s.airspeed, vspeed: s.vspeed }];
        return next.length > 120 ? next.slice(next.length - 120) : next;
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  function setManualField(field, value) {
    const next = { ...manualRef.current, [field]: value };
    manualRef.current = next;
    setManual(next);
  }

  function setTarget(field, value) {
    setTargets((t) => {
      const next = { ...t, [field]: value };
      targetsRef.current = next;
      return next;
    });
  }

  function setTargetFields(partial) {
    setTargets((t) => {
      const next = { ...t, ...partial };
      targetsRef.current = next;
      return next;
    });
  }

  function runScenario(type) {
    setMode("auto");
    const s = flightRef.current;
    if (type === "subida") setTargetFields({ altitude: clamp(s.altitude + 3000, 0, 25000), airspeed: 250 });
    if (type === "descida") setTargetFields({ altitude: clamp(s.altitude - 3000, 500, 25000), airspeed: 170 });
    if (type === "curva") {
      scenarioRef.current = { type: "turn360", accumulated: 0 };
      setScenarioActive(true);
    }
  }

  function reset() {
    flightRef.current = { ...DEFAULT_FLIGHT };
    setFlight({ ...DEFAULT_FLIGHT, displayPitch: 0, displayRoll: 0 });
    setTargets(DEFAULT_TARGETS);
    setManual(DEFAULT_MANUAL);
    setTurbulence(0);
    setHistory([]);
    scenarioRef.current = null;
    setScenarioActive(false);
    wobbleRef.current = { p: 0, r: 0 };
  }

  return {
    mode, setMode,
    flight,
    targets, setTarget,
    manual, setManualField,
    turbulence, setTurbulence,
    history,
    scenarioActive, runScenario,
    reset,
  };
}
