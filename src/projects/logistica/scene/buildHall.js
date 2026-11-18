import * as THREE from "three";

// Galpão: pilares, vigas, ponte rolante e lâmpadas. As caixas vão na camada "structure" (liga/desliga).
export function buildHall(scene, structureLayer) {
  const steel = new THREE.MeshStandardMaterial({
    color: "#879194",
    metalness: 0.72,
    roughness: 0.42,
  });
  const yellow = new THREE.MeshStandardMaterial({
    color: "#e5b52e",
    metalness: 0.35,
    roughness: 0.48,
  });
  const paleWall = new THREE.MeshStandardMaterial({ color: "#c1c8c5", roughness: 0.9 });
  const addBox = (w, h, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    structureLayer.add(m);
    return m;
  };
  // Larger industrial hall: 60 x 44 floor, raised steel bays and bridge crane rails.
  addBox(60, 5, 0.18, 0, 2.5, -22, paleWall);
  for (let x = -28; x <= 28; x += 8) {
    addBox(0.3, 10, 0.3, x, 5, -21.5, steel);
    addBox(0.3, 10, 0.3, x, 5, 21.5, steel);
    addBox(0.2, 1, 43, x, 8.9, 0, steel);
    addBox(0.18, 0.18, 43, x, 9.8, 0, steel);
  }
  for (let z of [-18, -12, -6, 0, 6, 12, 18]) {
    addBox(0.14, 0.14, 60, 0, 9.6, z, steel);
    addBox(60, 0.12, 0.14, 0, 10, z, steel);
  }
  addBox(60, 0.28, 0.4, 0, 7.4, -9, yellow);
  addBox(0.4, 1, 0.4, 0, 6.8, -9, yellow);
  addBox(0.4, 1, 0.4, -24, 6.8, -9, yellow);
  addBox(0.4, 1, 0.4, 24, 6.8, -9, yellow);
  addBox(48, 0.28, 0.4, 0, 7.4, -9, yellow);
  for (let x = -26; x <= 26; x += 13) addBox(0.34, 9.5, 0.34, x, 4.75, 21.2, steel);
  for (let x = -20; x <= 20; x += 10) {
    const lamp = new THREE.PointLight(0xfff3d3, 24, 20);
    lamp.position.set(x, 9, 1);
    scene.add(lamp);
  }
}
