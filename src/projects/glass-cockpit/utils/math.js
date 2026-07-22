export const deg2rad = (d) => (d * Math.PI) / 180;

export const wrap360 = (h) => ((h % 360) + 360) % 360;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Shortest signed distance from `current` to `target` heading, in degrees (-180..180).
export function headingDiff(target, current) {
  let d = wrap360(target - current);
  if (d > 180) d -= 360;
  return d;
}
