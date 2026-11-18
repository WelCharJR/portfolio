import * as THREE from "three";
import { ROWS, COLS } from "../constants.js";

// Monta a estante 3D de um kanban (6 fileiras x 10 caixas) já posicionada em k.x / k.z.
export function buildKanban(k) {
  const group = new THREE.Group();
  group.position.set(k.x, 0, k.z);
  group.rotation.y = THREE.MathUtils.degToRad(k.rotation || 0);
  group.userData.id = k.id;
  const frame = new THREE.MeshStandardMaterial({
    color: "#d8ded7",
    metalness: 0.45,
    roughness: 0.5,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#26353a",
    metalness: 0.25,
    roughness: 0.75,
  });
  const blue = new THREE.MeshStandardMaterial({ color: "#0877b7", roughness: 0.72 });
  const blueEmpty = new THREE.MeshStandardMaterial({ color: "#155879", roughness: 0.82 });
  const binLabel = new THREE.MeshStandardMaterial({ color: "#f0eadb" });
  const beam = (w, h, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    group.add(m);
  };
  beam(5.35, 0.18, 1.5, 0, 0.1, 0, dark);
  for (const x of [-2.58, 2.58])
    for (const z of [-0.62, 0.62]) beam(0.1, 3.65, 0.1, x, 1.85, z, frame);
  for (let row = 0; row < ROWS.length; row++) {
    const y = 0.28 + (ROWS.length - 1 - row) * 0.52;
    beam(5.1, 0.08, 1.25, 0, y, -0.02, frame);
    for (let col = 0; col < COLS; col++) {
      const slot = k.slots?.find((item) => item.id === `${ROWS[row]}-${col + 1}`) || {
        id: `${ROWS[row]}-${col + 1}`,
        code: "",
        name: "",
        qty: 0,
      };
      const x = (col - (COLS - 1) / 2) * 0.5;
      const bin = new THREE.Group();
      bin.position.set(x, y + 0.23, 0.25);
      bin.userData.slotId = slot.id;
      bin.userData.kanbanId = k.id;
      bin.userData.pullDirection = 1;
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.4, 0.72),
        slot.code ? blue : blueEmpty,
      );
      crate.castShadow = true;
      bin.add(crate);
      const lip = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.08), dark);
      lip.position.set(0, -0.11, 0.39);
      bin.add(lip);
      const tag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.025), binLabel);
      tag.position.set(0, -0.09, 0.377);
      bin.add(tag);
      const backBin = bin.clone(true);
      backBin.position.z = -0.25;
      backBin.rotation.y = Math.PI;
      backBin.userData.pullDirection = -1;
      group.add(bin, backBin);
    }
  }
  for (let i = 0; i < 3; i++) beam(5.2, 0.07, 0.09, 0, 0.35 + i * 1.04, -0.72, frame);
  return group;
}
