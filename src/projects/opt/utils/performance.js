import { G, RHO0 } from "../constants.js";

export function isaTemp(altFt) {
  return 15 - 1.98 * (altFt / 1000);
}

export function densityAltitude(elevFt, oat) {
  return elevFt + 120 * (oat - isaTemp(elevFt));
}

export function airDensity(densAltFt) {
  const ratio = Math.max(0.05, 1 - 6.87535e-6 * densAltFt);
  return RHO0 * Math.pow(ratio, 4.2561);
}

export function thrustAtAltitude(thrustSL, rho) {
  return thrustSL * Math.pow(rho / RHO0, 0.7);
}

// Distância de decolagem simplificada (Anderson, Aircraft Performance), ajustada por
// vento (a física de solo depende da velocidade em relação ao solo) e rampa da pista.
export function computeFlap({ weightKg, wingArea, clmax, thrustSL, rho, windKt, slopePct }) {
  const W = weightKg * G;
  const T = thrustAtAltitude(thrustSL, rho);
  const Vlo = Math.sqrt((2 * W) / (rho * wingArea * clmax));
  const Sg = (1.44 * W * W) / (G * rho * wingArea * clmax * T);
  const windMs = windKt * 0.514444;
  const factor = Math.max(0.35, (Vlo - windMs) / Vlo);
  let S = Sg * factor * factor;
  const slopeFactor = slopePct >= 0 ? 1 + 0.1 * slopePct : 1 + 0.05 * slopePct;
  S *= slopeFactor;
  const distance = S * 1.2;
  const V2 = Vlo * 1.2 * 1.94384;
  const VR = V2 * 0.95;
  const V1 = V2 * 0.9;
  return { V1, VR, V2, distance };
}

// Busca binária: maior peso que ainda cabe na pista informada, pra esse flap/condições.
// Não dá pra inverter a fórmula direto porque o vento também depende da velocidade de
// decolagem, que depende do peso — então testamos pesos até achar o limite.
export function solveFieldLimitWeight(ctx, runway) {
  const distAt = (w) => computeFlap({ ...ctx, weightKg: w }).distance;
  if (distAt(ctx.mtow) <= runway) return { weight: ctx.mtow, note: "MTOW estrutural" };
  if (distAt(ctx.minWeight) > runway) return { weight: ctx.minWeight, note: "pista insuficiente" };
  let lo = ctx.minWeight, hi = ctx.mtow;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (distAt(mid) <= runway) lo = mid; else hi = mid;
  }
  return { weight: lo, note: "limitado pela pista" };
}
