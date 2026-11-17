import { useEffect, useRef, useState } from "react";
import "./logistica.css";
import { KEY, pathTypes } from "./constants.js";
import { emptySlots, loadLayout } from "./data/layout.js";
import { useHangarScene } from "./hooks/useHangarScene.js";
import TopBar from "./components/TopBar.jsx";
import ScenePanel from "./components/ScenePanel.jsx";
import SidePanel from "./components/SidePanel.jsx";
import KanbanModal from "./components/KanbanModal.jsx";

export default function Logistica() {
  const canvas = useRef(null);
  const [layout, setLayout] = useState(loadLayout);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("Arraste os kanbans para reorganizar o hangar.");
  const [tool, setTool] = useState("select");
  const [pathType, setPathType] = useState("pedestrian");
  const pathTypeRef = useRef("pedestrian");
  const [draft, setDraft] = useState([]);
  const [cursorWorld, setCursorWorld] = useState(null);
  const [cursorScreen, setCursorScreen] = useState(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const snapRef = useRef(false);
  const clearPreviewRef = useRef(() => {});
  const toolRef = useRef("select");
  const draftRef = useRef([]);
  const [showStructure, setShowStructure] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const layerRefs = useRef({});
  const zoomRef = useRef(() => {});
  const focusRef = useRef(() => {});
  const [query, setQuery] = useState("");
  const [inspectedKanban, setInspectedKanban] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [focusedSlotId, setFocusedSlotId] = useState(null);
  const kanbanPositions = layout.kanbans.map(({ id, x, z }) => id + ":" + x + ":" + z).join("|");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(layout));
  }, [layout]);

  useHangarScene({
    canvas,
    layout,
    kanbanPositions,
    showStructure,
    showGrid,
    refs: {
      toolRef,
      draftRef,
      pathTypeRef,
      snapRef,
      layerRefs,
      clearPreviewRef,
      zoomRef,
      focusRef,
    },
    setters: {
      setLayout,
      setSelected,
      setSelectedSlotId,
      setNotice,
      setDraft,
      setCursorWorld,
      setCursorScreen,
    },
  });

  const addKanban = () => {
    const enteredName = window.prompt("Nome do kanban (deixe vazio para usar o nome genérico):", "");
    if (enteredName === null) return;
    const name = enteredName.trim() || "Novo kanban";
    const id = "K-" + String(Date.now()).slice(-4);
    setLayout((p) => ({
      ...p,
      kanbans: [...p.kanbans, { id, name, x: 0, z: 0, slots: emptySlots() }],
    }));
    setSelected(id);
    setNotice("Kanban adicionado. Arraste-o para o local desejado.");
  };
  const openKanban = (id, slotId = null) => {
    const k = layout.kanbans.find((item) => item.id === id);
    if (!k) return;
    setSelected(id);
    setInspectedKanban(id);
    setSelectedSlotId(slotId || k.slots?.find((s) => s.code)?.id || k.slots?.[0]?.id || null);
    setFocusedSlotId(slotId);
    focusRef.current(k.x, k.z, 9);
  };
  const updateSlot = (field, value) => {
    setLayout((p) => ({
      ...p,
      kanbans: p.kanbans.map((k) =>
        k.id !== inspectedKanban
          ? k
          : {
              ...k,
              slots: k.slots.map((slot) =>
                slot.id !== selectedSlotId
                  ? slot
                  : {
                      ...slot,
                      [field]: field === "qty" ? Math.max(0, Number(value) || 0) : value,
                      ...((field === "code" || field === "name") && value && !slot.qty
                        ? { qty: 10 }
                        : {}),
                    },
              ),
            },
      ),
    }));
  };
  const addItem = (item) => {
    const kanban = layout.kanbans.find((k) => k.id === item.kanbanId);
    const slot = kanban?.slots.find((s) => item.slotId ? s.id === item.slotId && !s.code : !s.code);
    if (!slot) { setNotice("Kanban sem caixas livres."); return; }
    setLayout((p) => ({ ...p, kanbans: p.kanbans.map((k) => k.id !== kanban.id ? k : { ...k, slots: k.slots.map((s) => s.id !== slot.id ? s : { ...s, code: item.code, name: item.name, qty: item.qty, unit: item.unit }) }) }));
    setNotice(item.code + " adicionado em " + kanban.id + " · " + slot.id);
  };
  const renameKanban = (id, name) => setLayout((p) => ({ ...p, kanbans: p.kanbans.map((k) => k.id === id ? { ...k, name } : k) }));
  const removeItem = (kanbanId, slotId) => {
    setLayout((p) => ({ ...p, kanbans: p.kanbans.map((k) => k.id !== kanbanId ? k : { ...k, slots: k.slots.map((s) => s.id !== slotId ? s : { ...s, code: "", name: "", qty: 0, unit: "un" }) }) }));
  };
  const inspected = layout.kanbans.find((k) => k.id === inspectedKanban);
  const chooseTool = (next) => {
    toolRef.current = next;
    setTool(next);
    draftRef.current = [];
    setDraft([]);
    setCursorWorld(null);
    setCursorScreen(null);
    clearPreviewRef.current();
    setNotice(
      next === "area"
        ? "Clique no piso para marcar os vértices da área."
        : "Clique no piso para traçar o caminho.",
    );
  };
  const choosePathType = (next) => {
    pathTypeRef.current = next;
    setPathType(next);
    clearPreviewRef.current();
  };
  const finishDrawing = () => {
    const points = draftRef.current;
    if (toolRef.current === "area" && points.length >= 3) {
      const id = "A-" + String(Date.now()).slice(-4);
      setLayout((p) => ({
        ...p,
        areas: [...p.areas, { id, name: "Área " + (p.areas.length + 1), points }],
      }));
      setSelected(id);
      setNotice("Área adicionada ao layout.");
    } else if (toolRef.current === "path" && points.length >= 2) {
      const id = "R-" + String(Date.now()).slice(-4);
      const config = pathTypes[pathTypeRef.current];
      setLayout((p) => ({
        ...p,
        paths: [
          ...p.paths,
          {
            id,
            name:
              (pathTypeRef.current === "pedestrian" ? "Estrada " : "Rota logística ") +
              (p.paths.length + 1),
            type: pathTypeRef.current,
            points,
            width: config.width,
          },
        ],
      }));
      setSelected(id);
      setNotice("Caminho adicionado ao layout.");
    }
    draftRef.current = [];
    setDraft([]);
    setCursorWorld(null);
    setCursorScreen(null);
    clearPreviewRef.current();
    toolRef.current = "select";
    setTool("select");
  };
  const cancelDrawing = () => {
    draftRef.current = [];
    setDraft([]);
    setCursorWorld(null);
    setCursorScreen(null);
    clearPreviewRef.current();
    toolRef.current = "select";
    setTool("select");
  };
  const removeSelected = () => {
    setLayout((p) => ({
      ...p,
      areas: p.areas.filter((x) => x.id !== selected),
      paths: p.paths.filter((x) => x.id !== selected),
    }));
    setSelected(null);
  };
  const closeKanban = () => {
    setInspectedKanban(null);
    setFocusedSlotId(null);
    focusRef.current(0, 0, 68);
  };
  const setPathWidth = (id, width) =>
    setLayout((p) => ({ ...p, paths: p.paths.map((x) => (x.id === id ? { ...x, width } : x)) }));

  useEffect(() => {
    if (focusedSlotId)
      document
        .getElementById("slot-" + focusedSlotId)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusedSlotId, inspectedKanban]);
  const toggleSnap = () => {
    snapRef.current = !snapRef.current;
    setSnapToGrid(snapRef.current);
  };
  const toggleLayer = (name, setter, value) => {
    if (layerRefs.current[name]) layerRefs.current[name].visible = !value;
    setter(!value);
  };
  return (
    <div className="log-app">
      <TopBar
        showGrid={showGrid}
        showStructure={showStructure}
        onZoom={(amount) => zoomRef.current(amount)}
        onToggleGrid={() => toggleLayer("grid", setShowGrid, showGrid)}
        onToggleStructure={() => toggleLayer("structure", setShowStructure, showStructure)}
        onAddKanban={addKanban}
      />
      <div className="log-body">
        <ScenePanel
          canvasRef={canvas}
          tool={tool}
          pathType={pathType}
          snapToGrid={snapToGrid}
          draft={draft}
          cursorWorld={cursorWorld}
          cursorScreen={cursorScreen}
          notice={notice}
          onChooseTool={chooseTool}
          onChoosePathType={choosePathType}
          onToggleSnap={toggleSnap}
          onFinish={finishDrawing}
          onCancel={cancelDrawing}
        />
        <SidePanel
          layout={layout}
          selected={selected}
          query={query}
          selectedSlotId={selectedSlotId}
          onQuery={setQuery}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onRenameKanban={renameKanban}
          onSelect={setSelected}
          onOpenKanban={openKanban}
          onNotice={setNotice}
          onPathWidth={setPathWidth}
          onRemove={removeSelected}
        />
      </div>
      {inspected && (
        <KanbanModal
          inspected={inspected}
          selectedSlotId={selectedSlotId}
          focusedSlotId={focusedSlotId}
          onClose={closeKanban}
          onSelectSlot={setSelectedSlotId}
          onUpdateSlot={updateSlot}
        />
      )}
    </div>
  );
}
