import * as THREE from "three";
import { pathTypes } from "../constants.js";
import { buildPathMesh } from "./buildDrawn.js";

// Pré-visualização do que está sendo desenhado (linha, preenchimento da área, marcadores).
export function createPreview(previewGroup, toolRef, pathTypeRef) {
  const clearPreview = () => {
    while (previewGroup.children.length) {
      const obj = previewGroup.children[0];
      previewGroup.remove(obj);
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material?.dispose();
    }
  };
  const refreshPreview = (points, hover) => {
    clearPreview();
    const visible = hover ? [...points, hover] : points;
    if (visible.length > 1) {
      const coords = visible.map((p) => new THREE.Vector3(p.x, 0.12, p.z));
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(coords),
        new THREE.LineBasicMaterial({ color: toolRef.current === "area" ? "#5ce0c5" : "#ffd15d" }),
      );
      previewGroup.add(line);
      if (toolRef.current === "area" && visible.length >= 3) {
        const shape = new THREE.Shape();
        visible.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, -p.z) : shape.lineTo(p.x, -p.z)));
        shape.closePath();
        const fill = new THREE.Mesh(
          new THREE.ShapeGeometry(shape),
          new THREE.MeshBasicMaterial({
            color: "#4aa899",
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        fill.rotation.x = -Math.PI / 2;
        fill.position.y = 0.08;
        previewGroup.add(fill);
      }
      if (toolRef.current === "path" && visible.length >= 2) {
        const config = pathTypes[pathTypeRef.current];
        previewGroup.add(
          buildPathMesh(visible, config.width, config.color, pathTypeRef.current === "pedestrian"),
        );
      }
    }
    visible.forEach((p, i) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(hover && i === visible.length - 1 ? 0.18 : 0.14, 12, 10),
        new THREE.MeshBasicMaterial({
          color:
            hover && i === visible.length - 1
              ? "#ffffff"
              : toolRef.current === "area"
                ? "#5ce0c5"
                : "#e2b644",
        }),
      );
      marker.position.set(p.x, 0.22, p.z);
      previewGroup.add(marker);
    });
  };
  return { clear: clearPreview, refresh: refreshPreview };
}
