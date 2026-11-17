import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildHall } from "../scene/buildHall.js";
import { buildKanban } from "../scene/buildKanban.js";
import { buildAreaMesh, buildPath } from "../scene/buildDrawn.js";
import { createPreview } from "../scene/createPreview.js";
import { createHoverFx } from "../scene/createHoverFx.js";

// Cena Three.js do hangar: câmera, luzes, galpão, kanbans, áreas, caminhos e mouse.
// Só é recriada quando muda a posição dos kanbans, as áreas ou os caminhos (mesmas dependências de antes).
export function useHangarScene({
  canvas,
  layout,
  kanbanPositions,
  showStructure,
  showGrid,
  refs,
  setters,
}) {
  const { toolRef, draftRef, pathTypeRef, snapRef, layerRefs, clearPreviewRef, zoomRef, focusRef } =
    refs;
  const {
    setLayout,
    setSelected,
    setSelectedSlotId,
    setNotice,
    setDraft,
    setCursorWorld,
    setCursorScreen,
    setHoveredItem,
  } = setters;

  // Sempre o layout mais recente (a cena não é recriada ao adicionar ou editar itens).
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  useEffect(() => {
    const host = canvas.current;
    const scene = new THREE.Scene();
    const previewGroup = new THREE.Group();
    scene.add(previewGroup);
    scene.background = new THREE.Color("#10191d");
    const camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 200);
    camera.position.set(18, 22, 25);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xdaf4ff, 0x273334, 2.2));
    const sun = new THREE.DirectionalLight(0xfff1d0, 3.5);
    sun.position.set(-8, 18, 8);
    sun.castShadow = true;
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 44),
      new THREE.MeshStandardMaterial({ color: "#263437", roughness: 0.92 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const gridLayer = new THREE.Group();
    scene.add(gridLayer);
    const grid = new THREE.GridHelper(60, 60, "#d4a84e", "#536366");
    grid.position.y = 0.015;
    gridLayer.add(grid);
    const structureLayer = new THREE.Group();
    structureLayer.visible = showStructure;
    scene.add(structureLayer);
    gridLayer.visible = showGrid;
    layerRefs.current = { structure: structureLayer, grid: gridLayer };
    buildHall(scene, structureLayer);
    const kanbanMeshes = new Map();
    const slotGroups = [];
    const drawnMeshes = [];
    layout.kanbans.forEach((k) => {
      const group = buildKanban(k);
      group.traverse((object) => { if (object.userData.slotId) slotGroups.push(object); });
      scene.add(group);
      kanbanMeshes.set(k.id, group);
    });
    layout.areas.forEach((area) => {
      const mesh = buildAreaMesh(area);
      scene.add(mesh);
      drawnMeshes.push(mesh);
    });
    layout.paths.forEach((path) => {
      if (path.points.length < 2) return;
      const group = buildPath(path);
      scene.add(group);
      drawnMeshes.push(group);
    });
    const controls = {
      down: false,
      lastX: 0,
      lastY: 0,
      angle: 0.63,
      radius: 68,
      radiusGoal: 68,
      target: new THREE.Vector3(0, 0, 0),
      targetGoal: new THREE.Vector3(0, 0, 0),
      dragging: null,
    };
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      hit = new THREE.Vector3();
    const updatePointer = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    function cameraUpdate() {
      camera.position.set(
        controls.target.x + Math.sin(controls.angle) * controls.radius,
        controls.radius * 0.62,
        controls.target.z + Math.cos(controls.angle) * controls.radius,
      );
      camera.lookAt(controls.target);
    }
    cameraUpdate();
    const snapPoint = (x, z) =>
      snapRef.current
        ? { x: Math.round(x), z: Math.round(z) }
        : { x: Number(x.toFixed(1)), z: Number(z.toFixed(1)) };
    const preview = createPreview(previewGroup, toolRef, pathTypeRef);
    const clearPreview = preview.clear,
      refreshPreview = preview.refresh;
    clearPreviewRef.current = clearPreview;
    // Puxada da caixa e porcas/parafusos no hover: só com mouse e respeitando "reduzir movimento".
    const hasMatchMedia = typeof window.matchMedia === "function";
    const media = (query) => hasMatchMedia && window.matchMedia(query).matches;
    const hoverFx = createHoverFx(scene, {
      enabled: !hasMatchMedia || media("(hover: hover)"),
      reducedMotion: media("(prefers-reduced-motion: reduce)"),
      isFilled: (kanbanId, slotId) =>
        !!layoutRef.current.kanbans
          .find((k) => k.id === kanbanId)
          ?.slots?.find((slot) => slot.id === slotId)?.code,
    });
    zoomRef.current = (amount) => {
      controls.radiusGoal = Math.max(9, Math.min(100, controls.radiusGoal + amount));
    };
    focusRef.current = (x, z, radius = 10) => {
      controls.targetGoal.set(x, 0, z);
      controls.radiusGoal = radius;
    };
    const onDown = (e) => {
      hoverFx.hover(null, performance.now());
      setHoveredItem(null);
      controls.down = true;
      controls.lastX = e.clientX;
      controls.lastY = e.clientY;
      const screen = updatePointer(e);
      setCursorScreen(screen);
      raycaster.setFromCamera(pointer, camera);
      if (toolRef.current === "area" || toolRef.current === "path") {
        if (raycaster.ray.intersectPlane(plane, hit)) {
          const point = snapPoint(hit.x, hit.z);
          const next = [...draftRef.current, point];
          draftRef.current = next;
          setDraft(next);
          setCursorWorld(point);
          refreshPreview(next, null);
        }
        controls.down = false;
        return;
      }
      const hits = raycaster.intersectObjects([...kanbanMeshes.values(), ...drawnMeshes], true);
      if (hits.length) {
        const hitObject = hits[0].object;
        let slotOwner = null;
        let o = hitObject;
        while (o.parent && !o.userData.id) {
          if (o.userData.slotId) slotOwner = o;
          o = o.parent;
        }
        controls.dragging = o.userData.kind ? null : o.userData.id;
        setSelected(o.userData.id);
        if (slotOwner) {
          setSelectedSlotId(slotOwner.userData.slotId);
          setNotice(`${o.userData.id} · caixa ${slotOwner.userData.slotId}`);
        }
      }
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    let hoveredSlot = null;
    const onMove = (e) => {
      if (!controls.down) {
        if (toolRef.current === "select") {
          updatePointer(e);
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects([...kanbanMeshes.values()], true)[0]?.object;
          let owner = hit;
          while (owner && !owner.userData.slotId) owner = owner.parent;
          const nextHoveredSlot = owner || null;
          if (nextHoveredSlot !== hoveredSlot) {
            hoveredSlot = nextHoveredSlot;
            const item = hoveredSlot && layoutRef.current.kanbans.find((k) => k.id === hoveredSlot.userData.kanbanId)?.slots.find((slot) => slot.id === hoveredSlot.userData.slotId);
            setHoveredItem(item?.code ? { ...item, kanbanId: hoveredSlot.userData.kanbanId } : null);
          }
          hoverFx.hover(hoveredSlot, performance.now());
          renderer.domElement.style.cursor = hoveredSlot ? "pointer" : "grab";
        }
        if (toolRef.current === "area" || toolRef.current === "path") {
          hoverFx.hover(null, performance.now());
          const screen = updatePointer(e);
          setCursorScreen(screen);
          raycaster.setFromCamera(pointer, camera);
          if (raycaster.ray.intersectPlane(plane, hit)) {
            const point = snapPoint(hit.x, hit.z);
            setCursorWorld((prev) =>
              !prev || prev.x !== point.x || prev.z !== point.z ? point : prev,
            );
            refreshPreview(draftRef.current, point);
          }
        }
        return;
      }
      const dx = e.clientX - controls.lastX,
        dy = e.clientY - controls.lastY;
      controls.lastX = e.clientX;
      controls.lastY = e.clientY;
      if (controls.dragging) {
        updatePointer(e);
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          const m = kanbanMeshes.get(controls.dragging);
          const point = snapPoint(hit.x, hit.z);
          m.position.x = point.x;
          m.position.z = point.z;
        }
      } else {
        controls.angle -= dx * 0.006;
        controls.radiusGoal = Math.max(28, Math.min(100, controls.radiusGoal + dy * 0.08));
      }
    };
    const onUp = () => {
      if (controls.dragging) {
        const id = controls.dragging,
          m = kanbanMeshes.get(id);
        setLayout((prev) => ({
          ...prev,
          kanbans: prev.kanbans.map((k) =>
            k.id === id ? { ...k, x: m.position.x, z: m.position.z } : k,
          ),
        }));
        controls.dragging = null;
        setNotice("Posição salva neste navegador.");
      }
      controls.down = false;
    };
    const onDoubleClick = (e) => {
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([...kanbanMeshes.values()], true)[0]?.object;
      let rack = hit;
      while (rack && !rack.userData.id) rack = rack.parent;
      const kanban = layoutRef.current.kanbans.find((item) => item.id === rack?.userData.id);
      if (!kanban) return;
      setSelected(kanban.id);
      focusRef.current(kanban.x, kanban.z, 11);
      setNotice(kanban.name + " · passe o cursor sobre uma caixa para ver o conteúdo");
    };
    renderer.domElement.addEventListener("dblclick", onDoubleClick);
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointerleave", () => { hoveredSlot = null; setHoveredItem(null); renderer.domElement.style.cursor = "grab"; hoverFx.hover(null, performance.now()); });
    const clock = new THREE.Clock();
    const draw = (time) => {
      hoverFx.update(time);
      const damping = 1 - Math.exp(-5 * clock.getDelta());
      controls.target.lerp(controls.targetGoal, damping);
      controls.radius += (controls.radiusGoal - controls.radius) * damping;
      slotGroups.forEach((object) => {
        const scale = object === hoveredSlot ? 1.08 : 1;
        object.scale.setScalar(object.scale.x + (scale - object.scale.x) * damping);
      });
      cameraUpdate();
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(draw);
    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener("resize", resize);
    return () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("dblclick", onDoubleClick);
      setHoveredItem(null);
      hoverFx.dispose();
      window.removeEventListener("resize", resize);
      clearPreview();
      clearPreviewRef.current = () => {};
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [kanbanPositions, layout.areas, layout.paths]);
}
