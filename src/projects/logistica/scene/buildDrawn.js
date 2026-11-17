import * as THREE from "three";
import { pathTypes } from "../constants.js";

// Área desenhada pelo usuário (polígono no piso).
export function buildAreaMesh(area) {
  const shape = new THREE.Shape();
  area.points.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, -p.z) : shape.lineTo(p.x, -p.z)));
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshStandardMaterial({
      color: "#4aa899",
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      roughness: 0.7,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.05;
  mesh.userData.id = area.id;
  mesh.userData.kind = "area";
  return mesh;
}

// Faixa de caminho suavizada (Catmull-Rom). Estrada de pedestres ganha bordas e linha tracejada.
export const buildPathMesh = (points, width, color, isRoad = false) => {
  const samples = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p.x, 0.075, p.z)),
  ).getPoints(Math.max(12, points.length * 10));
  const positions = [],
    indices = [];
  samples.forEach((p, i) => {
    const prev = samples[Math.max(0, i - 1)],
      next = samples[Math.min(samples.length - 1, i + 1)];
    const dx = next.x - prev.x,
      dz = next.z - prev.z,
      len = Math.hypot(dx, dz) || 1;
    const sx = ((-dz / len) * width) / 2,
      sz = ((dx / len) * width) / 2;
    positions.push(p.x + sx, 0.075, p.z + sz, p.x - sx, 0.075, p.z - sz);
    if (i < samples.length - 1) {
      const a = i * 2,
        b = a + 1,
        d = a + 2,
        e = a + 3;
      indices.push(a, b, d, b, e, d);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const group = new THREE.Group();
  group.userData.kind = "path";
  group.add(
    new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.88,
        side: THREE.DoubleSide,
        emissive: isRoad ? "#111719" : "#60430b",
        emissiveIntensity: 0.25,
      }),
    ),
  );
  if (isRoad) {
    for (const side of [-1, 1]) {
      const edge = samples.map((p, i) => {
        const prev = samples[Math.max(0, i - 1)],
          next = samples[Math.min(samples.length - 1, i + 1)],
          dx = next.x - prev.x,
          dz = next.z - prev.z,
          len = Math.hypot(dx, dz) || 1;
        return new THREE.Vector3(
          p.x - (dz / len) * width * 0.46,
          0.1,
          p.z + (dx / len) * width * 0.46,
        );
      });
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(edge),
          new THREE.LineBasicMaterial({ color: "#e5d9b5" }),
        ),
      );
    }
    const center = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        samples.map((p) => new THREE.Vector3(p.x, 0.105, p.z)),
      ),
      new THREE.LineDashedMaterial({ color: "#d8c58c", dashSize: 0.55, gapSize: 0.45 }),
    );
    center.computeLineDistances();
    group.add(center);
  }
  return group;
};

// Caminho salvo no layout -> objeto 3D com id/kind para o clique funcionar.
export function buildPath(path) {
  const type = pathTypes[path.type] || pathTypes.logistics;
  const group = buildPathMesh(
    path.points,
    path.width || type.width,
    type.color,
    path.type === "pedestrian",
  );
  group.userData.id = path.id;
  group.userData.kind = "path";
  return group;
}
