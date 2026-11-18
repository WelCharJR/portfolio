import * as THREE from "three";
import {
  MOTION,
  createTween,
  valueAt,
  retarget,
  spawnBurst,
  stepPiece,
  pieceOpacity,
} from "./hoverMotion.js";

const noop = { hover() {}, update() {}, dispose() {} };

// Efeito de hover das caixas: a caixa sob o mouse desliza para frente e solta porcas e parafusos.
//   hover(bin | null, now)  -> define qual caixa está sob o mouse (now em ms, como o rAF)
//   update(now)             -> chamado a cada frame: move as caixas e as peças
//   dispose()               -> remove tudo da cena e devolve as caixas à posição original
// `bin` é o grupo criado em buildKanban (userData.kanbanId / userData.slotId).
export function createHoverFx(
  scene,
  { isFilled = () => true, reducedMotion = false, enabled = true, rand = Math.random } = {},
) {
  if (!enabled) return noop;

  const distance = reducedMotion ? MOTION.reducedPullDistance : MOTION.pullDistance;
  const bins = new Map(); // caixa -> { tween, base }  (só enquanto está fora do repouso)
  const lastBurst = new WeakMap();
  let current = null;
  let last = null;

  // ---- pool de peças (criadas uma vez, reaproveitadas) ----
  const nutGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 6);
  const headGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 6);
  const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8);
  shaftGeo.translate(0, -0.12, 0);
  const geometries = [nutGeo, headGeo, shaftGeo];

  const makeSlot = (kind) => {
    const mat = new THREE.MeshStandardMaterial({
      color: kind === "nut" ? "#c4cad2" : "#8f98a3",
      metalness: 0.8,
      roughness: 0.35,
      transparent: true,
    });
    let obj;
    if (kind === "nut") {
      obj = new THREE.Mesh(nutGeo, mat);
    } else {
      obj = new THREE.Group();
      obj.add(new THREE.Mesh(headGeo, mat), new THREE.Mesh(shaftGeo, mat));
    }
    obj.userData.fx = true;
    obj.visible = false;
    scene.add(obj);
    return { obj, mat, p: null };
  };
  const half = MOTION.poolSize / 2;
  const pool = {
    nut: Array.from({ length: half }, () => makeSlot("nut")),
    bolt: Array.from({ length: half }, () => makeSlot("bolt")),
  };
  const slots = [...pool.nut, ...pool.bolt];

  const sync = (slot) => {
    const p = slot.p;
    slot.obj.position.set(p.x, p.y, p.z);
    slot.obj.rotation.set(p.rx, p.ry, p.rz);
    slot.mat.opacity = pieceOpacity(p);
  };

  const origin = new THREE.Vector3();
  const pullVector = new THREE.Vector3();
  const burst = (bin, now) => {
    if (now - (lastBurst.get(bin) ?? -Infinity) < MOTION.cooldownMs) return;
    const pieces = spawnBurst(rand, MOTION.burstCount);
    const free = { nut: pool.nut.filter((s) => !s.p), bolt: pool.bolt.filter((s) => !s.p) };
    const need = { nut: 0, bolt: 0 };
    pieces.forEach((p) => need[p.kind]++);
    if (free.nut.length < need.nut || free.bolt.length < need.bolt) return;
    bin.getWorldPosition(origin);
    bin.getWorldDirection(pullVector).multiplyScalar(distance + 0.3);
    pieces.forEach((p) => {
      const slot = free[p.kind].shift();
      p.x = origin.x + (rand() - 0.5) * 0.2;
      p.y = origin.y + 0.22 + pullVector.y;
      p.z = origin.z + pullVector.z;
      slot.p = p;
      slot.obj.visible = true;
      sync(slot);
    });
    lastBurst.set(bin, now);
  };

  return {
    hover(bin, now) {
      if (bin === current) return;
      if (bin && !isFilled(bin.userData.kanbanId, bin.userData.slotId)) bin = null;
      if (bin === current) return;
      const leaving = bins.get(current);
      if (leaving) retarget(leaving.tween, 0, now, MOTION.pullMs);
      current = bin;
      if (!bin) return;
      let state = bins.get(bin);
      if (!state) {
        state = { tween: createTween(0), base: bin.position.z };
        bins.set(bin, state);
      }
      retarget(state.tween, 1, now, MOTION.pullMs);
      if (!reducedMotion) burst(bin, now);
    },

    update(now) {
      for (const [bin, state] of bins) {
        const v = valueAt(state.tween, now);
        bin.position.z = state.base + v * distance * (bin.userData.pullDirection || 1);
        if (state.tween.to === 0 && v === 0) {
          bin.position.z = state.base;
          bins.delete(bin);
        }
      }
      const dt = last === null ? 0 : Math.min(MOTION.maxDt, Math.max(0, (now - last) / 1000));
      last = now;
      for (const slot of slots) {
        if (!slot.p) continue;
        stepPiece(slot.p, dt, MOTION.floorY);
        if (slot.p.age >= slot.p.life) {
          slot.p = null;
          slot.obj.visible = false;
        } else {
          sync(slot);
        }
      }
    },

    dispose() {
      for (const [bin, state] of bins) bin.position.z = state.base;
      bins.clear();
      current = null;
      slots.forEach((s) => {
        scene.remove(s.obj);
        s.mat.dispose();
      });
      geometries.forEach((g) => g.dispose());
    },
  };
}
