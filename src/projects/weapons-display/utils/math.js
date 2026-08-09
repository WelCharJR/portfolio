export const v = (x, y) => ({ x, y });
export const vadd = (a, b) => v(a.x + b.x, a.y + b.y);
export const vsub = (a, b) => v(a.x - b.x, a.y - b.y);
export const vscale = (a, s) => v(a.x * s, a.y * s);
export const vlen = (a) => Math.hypot(a.x, a.y);
export const vdot = (a, b) => a.x * b.x + a.y * b.y;
export const vcross = (a, b) => a.x * b.y - a.y * b.x;

export const deg2rad = (d) => (d * Math.PI) / 180;
export const rad2deg = (r) => (r * 180) / Math.PI;

export function normAngle(rad) {
  while (rad > Math.PI) rad -= 2 * Math.PI;
  while (rad < -Math.PI) rad += 2 * Math.PI;
  return rad;
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function aspectLabel(deg) {
  if (deg < 35) return "HOT";
  if (deg > 145) return "COLD";
  return "FLANK";
}
