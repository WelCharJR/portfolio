// Matemática do hover das caixas: curva, tween com retarget e física das peças.
// Sem Three.js, para poder ser testada direto no Node.

export const MOTION = {
  pullDistance: 0.28,
  reducedPullDistance: 0.12,
  pullMs: 180,
  cooldownMs: 600,
  burstCount: 6,
  poolSize: 30,
  life: 1.4,
  fade: 0.35,
  gravity: 9.8,
  restitution: 0.4,
  bounceDamping: 0.6,
  restSpeed: 0.8,
  floorY: 0.04,
  maxDt: 0.05,
};

// Equivalente ao cubic-bezier() do CSS: recebe o tempo (0..1) e devolve o progresso (0..1).
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sampleX = (s) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s) => ((ay * s + by) * s + cy) * s;
  const slopeX = (s) => (3 * ax * s + 2 * bx) * s + cx;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let s = t;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(s) - t;
      if (Math.abs(err) < 1e-7) return sampleY(s);
      const slope = slopeX(s);
      if (Math.abs(slope) < 1e-6) break;
      s -= err / slope;
    }
    let lo = 0, hi = 1;
    s = t;
    for (let i = 0; i < 40; i++) {
      const x = sampleX(s);
      if (Math.abs(x - t) < 1e-7) break;
      if (t > x) lo = s; else hi = s;
      s = (lo + hi) / 2;
    }
    return sampleY(s);
  };
}

export const easeOut = cubicBezier(0.23, 1, 0.32, 1);

// Tween que pode ser redirecionado a qualquer momento partindo do valor atual.
export const createTween = (value = 0) => ({ from: value, to: value, start: 0, duration: 0 });

export function valueAt(tween, now) {
  if (tween.duration <= 0 || now >= tween.start + tween.duration) return tween.to;
  if (now <= tween.start) return tween.from;
  return tween.from + (tween.to - tween.from) * easeOut((now - tween.start) / tween.duration);
}

export function retarget(tween, to, now, duration) {
  tween.from = valueAt(tween, now);
  tween.to = to;
  tween.start = now;
  tween.duration = duration;
}

// Peças de um disparo: porcas e parafusos alternados, com velocidades sorteadas por rand() em [0,1).
export function spawnBurst(rand, count) {
  const r = (min, max) => min + (max - min) * rand();
  return Array.from({ length: count }, (_, i) => ({
    kind: i % 2 === 0 ? "nut" : "bolt",
    x: 0, y: 0, z: 0,
    vx: r(-0.9, 0.9), vy: r(2, 3.2), vz: r(0.9, 1.7),
    rx: 0, ry: 0, rz: 0,
    sx: r(-10, 10), sy: r(-10, 10), sz: r(-10, 10),
    age: 0,
    life: MOTION.life,
  }));
}

// Um passo de física: gravidade, movimento, giro e um quique no chão que acaba parando.
export function stepPiece(p, dt, floorY) {
  p.age += dt;
  p.vy -= MOTION.gravity * dt;
  p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
  p.rx += p.sx * dt; p.ry += p.sy * dt; p.rz += p.sz * dt;
  if (p.y <= floorY && p.vy < 0) {
    p.y = floorY;
    p.vy = -p.vy * MOTION.restitution;
    p.vx *= MOTION.bounceDamping;
    p.vz *= MOTION.bounceDamping;
    if (p.vy < MOTION.restSpeed) {
      p.vy = 0; p.vx = 0; p.vz = 0;
      p.sx = 0; p.sy = 0; p.sz = 0;
    }
  }
}

export function pieceOpacity(p) {
  const fadeStart = p.life - MOTION.fade;
  if (p.age <= fadeStart) return 1;
  if (p.age >= p.life) return 0;
  return (p.life - p.age) / MOTION.fade;
}
