// Barra superior: zoom, camadas da cena e novo kanban.
export default function TopBar({
  viewOnly,
  onToggleViewOnly,
  showGrid,
  showStructure,
  onZoom,
  onToggleGrid,
  onToggleStructure,
  onAddKanban,
}) {
  return (
    <header className="log-top">
      <div>
        <span className="log-eyebrow">HANGAR DIGITAL · LOGÍSTICA</span>
        <h2>Layout de materiais</h2>
      </div>
      <div className="log-actions">
        <button onClick={() => onZoom(-8)} aria-label="Afastar">
          −
        </button>
        <button onClick={() => onZoom(8)} aria-label="Aproximar">
          ＋
        </button>
        <button className={showGrid ? "" : "muted"} onClick={() => onToggleGrid()}>
          Grade {showGrid ? "visível" : "oculta"}
        </button>
        <button className={showStructure ? "" : "muted"} onClick={() => onToggleStructure()}>
          Estrutura {showStructure ? "visível" : "oculta"}
        </button>
        <button className={viewOnly ? "view-mode-on" : "muted"} onClick={onToggleViewOnly} aria-pressed={viewOnly}>
          {viewOnly ? "Visualização ligada" : "Modo visualização"}
        </button>
        {!viewOnly && <button onClick={onAddKanban}>＋ Kanban</button>}
      </div>
    </header>
  );
}
