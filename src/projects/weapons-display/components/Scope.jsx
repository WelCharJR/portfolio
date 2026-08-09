import { NM, SCOPE_RANGE_NM, WEAPONS } from "../constants.js";
import { v, deg2rad, rad2deg } from "../utils/math.js";
import CalloutBanner from "./CalloutBanner.jsx";

const CX = 250, CY = 250, SCOPE_R = 220;
const PX_PER_NM = SCOPE_R / SCOPE_RANGE_NM;

function toScreen(pos) {
  const nmX = pos.x / NM, nmY = pos.y / NM;
  return { x: CX + nmX * PX_PER_NM, y: CY - nmY * PX_PER_NM };
}

export default function Scope({ phase, weapon, tRange, tBearing, tHeading, render, callout, result }) {
  const w = WEAPONS[weapon];
  const rmaxPx = w.rmaxNm * PX_PER_NM;
  const locked = phase === "locked" || phase === "flight" || phase === "result";

  const staticTargetPos = v(Math.sin(deg2rad(tBearing)) * tRange * NM, Math.cos(deg2rad(tBearing)) * tRange * NM);
  const targetScreenPos = render ? toScreen(render.targetPos) : toScreen(staticTargetPos);
  const missileScreen = render ? toScreen(render.missilePos) : null;

  return (
    <div style={{ position: "relative", width: 500, maxWidth: "100%" }}>
      <svg viewBox="0 0 500 500" style={{ width: "100%", height: "auto", background: "radial-gradient(circle, #061008 0%, #030503 100%)", borderRadius: "50%", border: "2px solid #1a2e1e" }}>
        <defs><clipPath id="scopeClip"><circle cx={CX} cy={CY} r={SCOPE_R} /></clipPath></defs>
        <g clipPath="url(#scopeClip)">
          {[10, 20, 30, 40].map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r * PX_PER_NM} fill="none" stroke="var(--line)" strokeWidth="1" />
          ))}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = deg2rad(i * 10);
            const x1 = CX + Math.sin(a) * (SCOPE_R - 6), y1 = CY - Math.cos(a) * (SCOPE_R - 6);
            const x2 = CX + Math.sin(a) * SCOPE_R, y2 = CY - Math.cos(a) * SCOPE_R;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" strokeWidth="1" />;
          })}
          {phase !== "result" && (
            <g className="sweep">
              <path d={`M ${CX} ${CY} L ${CX} ${CY - SCOPE_R} A ${SCOPE_R} ${SCOPE_R} 0 0 1 ${CX + SCOPE_R * Math.sin(deg2rad(25))} ${CY - SCOPE_R * Math.cos(deg2rad(25))} Z`} fill="var(--green)" opacity="0.06" />
            </g>
          )}
          {phase !== "flight" && phase !== "result" && (
            <circle cx={CX} cy={CY} r={rmaxPx} fill="none" stroke="var(--amber)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          )}

          <polygon points={`${CX},${CY - 8} ${CX - 6},${CY + 6} ${CX + 6},${CY + 6}`} fill="var(--cyan)" />

          {(() => {
            const p = targetScreenPos;
            const liveHeadingRad = render && phase === "flight" ? render.targetHeadingRad : deg2rad(tHeading);
            const hv = { x: Math.sin(liveHeadingRad), y: -Math.cos(liveHeadingRad) };
            const notching = render && render.notching && phase === "flight";
            const notchRelevant = notching && weapon === "fox1";
            const targetColor = notchRelevant ? "var(--cyan)" : locked ? "var(--red)" : "var(--green)";
            return (
              <g>
                {locked ? (
                  <rect x={p.x - 6} y={p.y - 6} width="12" height="12" fill={targetColor} transform={`rotate(45 ${p.x} ${p.y})`} />
                ) : (
                  <rect x={p.x - 6} y={p.y - 6} width="12" height="12" fill="none" stroke="var(--green)" strokeWidth="1.5" transform={`rotate(45 ${p.x} ${p.y})`} />
                )}
                <line x1={p.x} y1={p.y} x2={p.x + hv.x * 22} y2={p.y + hv.y * 22} stroke={targetColor} strokeWidth={notchRelevant ? 2.4 : 1.3} />
                <text x={p.x + 12} y={p.y - 10} fontSize="9" fill={targetColor} className="mono">TGT</text>
                {notching && (
                  <text x={p.x + 12} y={p.y + 16} fontSize="9" fontWeight="700" fill={notchRelevant ? "var(--cyan)" : "var(--dim)"} className="mono">
                    NOTCH{notchRelevant ? "" : " (s/ efeito)"}
                  </text>
                )}
              </g>
            );
          })()}

          {missileScreen && phase === "flight" && (() => {
            const heading = Math.atan2(render.missileVel.x, render.missileVel.y);
            return (
              <polygon
                points={`${missileScreen.x},${missileScreen.y - 6} ${missileScreen.x - 4},${missileScreen.y + 5} ${missileScreen.x + 4},${missileScreen.y + 5}`}
                fill="var(--amber)"
                transform={`rotate(${rad2deg(heading)} ${missileScreen.x} ${missileScreen.y})`}
              />
            );
          })()}
        </g>
        <circle cx={CX} cy={CY} r={SCOPE_R} fill="none" stroke="#1a2e1e" strokeWidth="1.5" />
        {["N", "E", "S", "W"].map((label, i) => {
          const a = deg2rad(i * 90);
          const x = CX + Math.sin(a) * (SCOPE_R + 14), y = CY - Math.cos(a) * (SCOPE_R + 14);
          return <text key={label} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="var(--dim)" className="mono">{label}</text>;
        })}
      </svg>
      <CalloutBanner text={callout} tone={result === "hit" ? "good" : result ? "bad" : callout && callout.includes("PERDEU") ? "warn" : null} />
    </div>
  );
}
