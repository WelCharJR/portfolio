import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createHoverFx } from "./createHoverFx.js";
import { MOTION } from "./hoverMotion.js";

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} ≉ ${b}`);
const rand = () => 0.5;
const BASE = 0.25;

function setup(options = {}) {
  const scene = new THREE.Scene();
  const makeBin = (slotId = "A-1", x = 0) => {
    const bin = new THREE.Group();
    bin.position.set(x, 1, BASE);
    bin.userData.kanbanId = "K-01";
    bin.userData.slotId = slotId;
    scene.add(bin);
    return bin;
  };
  const fx = createHoverFx(scene, { isFilled: () => true, rand, ...options });
  const visible = () => scene.children.filter((o) => o.userData.fx && o.visible).length;
  const fxObjects = () => scene.children.filter((o) => o.userData.fx).length;
  // avança o relógio em passos de 20 ms, como o laço de render faria
  const run = (from, to) => { for (let t = from; t <= to; t += 20) fx.update(t); };
  return { scene, fx, makeBin, visible, fxObjects, run };
}

test("hover puxa a caixa 0,28 para frente em 180 ms", () => {
  const { fx, makeBin } = setup();
  const bin = makeBin();
  fx.hover(bin, 0);
  fx.update(0);
  assert.equal(bin.position.z, BASE);
  fx.update(180);
  near(bin.position.z, BASE + MOTION.pullDistance);
});

test("sair devolve exatamente à posição original", () => {
  const { fx, makeBin } = setup();
  const bin = makeBin();
  fx.hover(bin, 0); fx.update(0); fx.update(180);
  fx.hover(null, 200); fx.update(200); fx.update(380);
  assert.equal(bin.position.z, BASE);
});

test("trocar de caixa no meio do movimento não dá salto", () => {
  const { fx, makeBin } = setup();
  const a = makeBin("A-1", 0), b = makeBin("A-2", 1);
  fx.hover(a, 0); fx.update(0); fx.update(90);
  const zA = a.position.z;
  fx.hover(b, 90); fx.update(90);
  near(a.position.z, zA, 1e-9);
  assert.equal(b.position.z, BASE);
  fx.update(270);
  assert.equal(a.position.z, BASE);
  near(b.position.z, BASE + MOTION.pullDistance);
});

test("caixa ocupada solta 6 peças (3 porcas e 3 parafusos), sem repetir no mesmo hover", () => {
  const { fx, makeBin, visible } = setup();
  const bin = makeBin();
  fx.hover(bin, 0);
  assert.equal(visible(), 6);
  fx.hover(bin, 10);
  assert.equal(visible(), 6);
});

test("caixa vazia não puxa e não solta nada", () => {
  const { fx, makeBin, visible } = setup({ isFilled: () => false });
  const bin = makeBin();
  fx.hover(bin, 0); fx.update(0); fx.update(200);
  assert.equal(bin.position.z, BASE);
  assert.equal(visible(), 0);
});

test("reducedMotion: puxada menor e nenhuma peça", () => {
  const { fx, makeBin, visible } = setup({ reducedMotion: true });
  const bin = makeBin();
  fx.hover(bin, 0); fx.update(0); fx.update(180);
  near(bin.position.z, BASE + MOTION.reducedPullDistance);
  assert.equal(visible(), 0);
});

test("enabled:false não cria objetos nem mexe na caixa", () => {
  const { scene, fx, makeBin } = setup({ enabled: false });
  const bin = makeBin();
  const before = scene.children.length;
  fx.hover(bin, 0); fx.update(0); fx.update(200); fx.hover(null, 300); fx.dispose();
  assert.equal(scene.children.length, before);
  assert.equal(bin.position.z, BASE);
});

test("pausa de 600 ms por caixa entre disparos", () => {
  const { fx, makeBin, visible } = setup();
  const bin = makeBin();
  fx.hover(bin, 0);
  fx.hover(null, 100);
  fx.hover(bin, 200);
  assert.equal(visible(), 6);
  fx.hover(null, 300);
  fx.hover(bin, 700);
  assert.equal(visible(), 12);
});

test("pool de 30 peças: o sexto disparo simultâneo é ignorado", () => {
  const { fx, makeBin, visible, fxObjects } = setup();
  const bins = Array.from({ length: 6 }, (_, i) => makeBin(`A-${i + 1}`, i));
  bins.forEach((bin, i) => fx.hover(bin, i * 10));
  assert.equal(visible(), 30);
  assert.equal(fxObjects(), 30);
});

test("peças voltam ao pool depois da vida e podem ser reutilizadas", () => {
  const { fx, makeBin, visible, fxObjects, run } = setup();
  const bin = makeBin();
  fx.hover(bin, 0);
  run(0, 1600);
  assert.equal(visible(), 0);
  fx.hover(null, 1700);
  fx.hover(bin, 2000);
  assert.equal(visible(), 6);
  assert.equal(fxObjects(), 30);
});

test("peças somem com fade no fim da vida", () => {
  const { scene, fx, makeBin, run } = setup();
  const bin = makeBin();
  fx.hover(bin, 0);
  run(0, 1300);
  const opacities = [];
  scene.children.filter((o) => o.userData.fx && o.visible).forEach((o) =>
    o.traverse((c) => { if (c.isMesh) opacities.push(c.material.opacity); }));
  assert.ok(opacities.length > 0);
  assert.ok(opacities.every((v) => v > 0 && v < 1), `opacidades: ${opacities}`);
});

test("peças nascem acima da caixa e caem com a gravidade", () => {
  const { scene, fx, makeBin, run } = setup();
  const bin = makeBin();
  fx.hover(bin, 0);
  const first = scene.children.find((o) => o.userData.fx && o.visible);
  fx.update(0);
  assert.ok(first.position.y > 1.1, `y inicial ${first.position.y}`);
  run(20, 1000);
  assert.ok(first.position.y < 0.5, `y depois de cair ${first.position.y}`);
});

test("dispose remove os objetos e devolve a caixa à posição original", () => {
  const { fx, makeBin, fxObjects } = setup();
  const bin = makeBin();
  fx.hover(bin, 0); fx.update(0); fx.update(100);
  assert.notEqual(bin.position.z, BASE);
  fx.dispose();
  assert.equal(fxObjects(), 0);
  assert.equal(bin.position.z, BASE);
});

test("hover(null) sem nada em andamento não quebra", () => {
  const { fx } = setup();
  assert.doesNotThrow(() => { fx.hover(null, 0); fx.update(0); fx.dispose(); });
});
