import test from "node:test";
import assert from "node:assert/strict";
import {
  cubicBezier,
  easeOut,
  createTween,
  valueAt,
  retarget,
  spawnBurst,
  stepPiece,
  pieceOpacity,
  MOTION,
} from "./hoverMotion.js";

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} ≉ ${b}`);
const piece = (over = {}) => ({
  kind: "nut", x: 0, y: 5, z: 0, vx: 0, vy: 0, vz: 0,
  rx: 0, ry: 0, rz: 0, sx: 0, sy: 0, sz: 0, age: 0, life: 1.4, ...over,
});

test("constantes seguem o design", () => {
  assert.equal(MOTION.pullDistance, 0.28);
  assert.equal(MOTION.reducedPullDistance, 0.12);
  assert.equal(MOTION.pullMs, 180);
  assert.equal(MOTION.cooldownMs, 600);
  assert.equal(MOTION.poolSize, 30);
  assert.equal(MOTION.burstCount, 6);
});

test("cubicBezier começa em 0, termina em 1 e nunca recua", () => {
  const f = cubicBezier(0.23, 1, 0.32, 1);
  near(f(0), 0);
  near(f(1), 1);
  let prev = 0;
  for (let i = 1; i <= 100; i++) {
    const v = f(i / 100);
    assert.ok(v >= prev - 1e-9, `recuou em ${i / 100}`);
    prev = v;
  }
});

test("easeOut é forte no começo (25% do tempo já passa de 50% do caminho)", () => {
  assert.ok(easeOut(0.25) > 0.5);
});

test("valueAt: antes do início fica no valor inicial, depois do fim no final", () => {
  const t = createTween(0);
  retarget(t, 1, 100, 180);
  assert.equal(valueAt(t, 50), 0);
  assert.equal(valueAt(t, 100), 0);
  assert.equal(valueAt(t, 280), 1);
  assert.equal(valueAt(t, 999), 1);
  const mid = valueAt(t, 190);
  assert.ok(mid > 0.5 && mid < 1, `meio = ${mid}`);
});

test("retarget no meio do movimento parte do valor atual, sem salto", () => {
  const t = createTween(0);
  retarget(t, 1, 0, 180);
  const before = valueAt(t, 60);
  retarget(t, 0, 60, 180);
  near(valueAt(t, 60), before, 1e-9);
  assert.equal(valueAt(t, 240), 0);
});

test("spawnBurst: 3 porcas e 3 parafusos alternados, nos limites do design", () => {
  const lo = spawnBurst(() => 0, 6);
  const hi = spawnBurst(() => 0.999999, 6);
  assert.deepEqual(lo.map((p) => p.kind), ["nut", "bolt", "nut", "bolt", "nut", "bolt"]);
  assert.equal(hi.length, 6);
  near(lo[0].vy, 2); near(hi[0].vy, 3.2, 1e-3);
  near(lo[0].vz, 0.9); near(hi[0].vz, 1.7, 1e-3);
  near(lo[0].vx, -0.9); near(hi[0].vx, 0.9, 1e-3);
  near(lo[0].sx, -10); near(hi[0].sx, 10, 1e-3);
  assert.equal(lo[0].life, 1.4);
  assert.equal(lo[0].age, 0);
});

test("stepPiece aplica gravidade, move e gira", () => {
  const p = piece({ vx: 1, sx: 2 });
  stepPiece(p, 0.1, 0.04);
  near(p.vy, -0.98, 1e-9);
  assert.ok(p.y < 5);
  near(p.x, 0.1, 1e-9);
  near(p.rx, 0.2, 1e-9);
  near(p.age, 0.1, 1e-9);
});

test("stepPiece quica no chão com restituição 0,4 e amortece o deslize", () => {
  const p = piece({ y: 0.1, vy: -5, vx: 1, vz: 1 });
  stepPiece(p, 0.05, 0.04);
  assert.equal(p.y, 0.04);
  near(p.vy, (5 + 9.8 * 0.05) * 0.4, 1e-9);
  assert.ok(p.vx < 1 && p.vz < 1);
});

test("stepPiece para de vez no chão (sem tremer)", () => {
  const p = piece({ y: 0.04, vy: 0, vx: 0.3, sx: 4 });
  for (let i = 0; i < 40; i++) stepPiece(p, 0.016, 0.04);
  assert.equal(p.y, 0.04);
  assert.equal(p.vy, 0);
  assert.equal(p.vx, 0);
  assert.equal(p.sx, 0);
});

test("pieceOpacity: 1 antes do fade, linear no fade, 0 na vida", () => {
  assert.equal(pieceOpacity(piece({ age: 0 })), 1);
  assert.equal(pieceOpacity(piece({ age: 1 })), 1);
  near(pieceOpacity(piece({ age: 1.05 })), 1, 1e-9); // limite do fade: contínuo, sem salto
  near(pieceOpacity(piece({ age: 1.225 })), 0.5, 1e-9);
  assert.equal(pieceOpacity(piece({ age: 1.4 })), 0);
  assert.equal(pieceOpacity(piece({ age: 2 })), 0);
});
