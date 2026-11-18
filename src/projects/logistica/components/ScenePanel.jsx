// Área da cena 3D: ferramentas de desenho, coordenadas, canvas, mira e barra de status.
export default function ScenePanel({
  canvasRef,
  viewOnly,
  tool,
  pathType,
  snapToGrid,
  draft,
  cursorWorld,
  cursorScreen,
  notice,
  onChooseTool,
  onChoosePathType,
  onToggleSnap,
  onFinish,
  onCancel,
}) {
  return (
    <section className="log-scene">
      <div className="log-tools">
        <button
          className={tool === "select" ? "active" : ""}
          onClick={() => onChooseTool("select")}
        >
          Selecionar
        </button>
        {!viewOnly && <>
        <button className={tool === "area" ? "active" : ""} onClick={() => onChooseTool("area")}>
          ＋ Área
        </button>
        <button className={tool === "path" ? "active" : ""} onClick={() => onChooseTool("path")}>
          ＋ Caminho
        </button>
        {tool === "path" && (
          <select
            className="log-path-type"
            aria-label="Tipo de caminho"
            value={pathType}
            onChange={(e) => onChoosePathType(e.target.value)}
          >
            <option value="pedestrian">Estrada · pessoas</option>
            <option value="logistics">Rota logística</option>
          </select>
        )}
        <button className={snapToGrid ? "active" : ""} onClick={onToggleSnap}>
          Malha {snapToGrid ? "1 m ligada" : "desligada"}
        </button>
        </>}
        {!viewOnly && tool !== "select" && (
          <>
            <span>{draft.length} pontos</span>
            <button onClick={onFinish} disabled={draft.length < (tool === "area" ? 3 : 2)}>
              Concluir
            </button>
            <button onClick={onCancel}>Cancelar</button>
          </>
        )}
      </div>
      <div className="log-key-help">R girar · WASD mover · Shift passo maior</div>
      <div className="log-position">
        {tool !== "select" && cursorWorld
          ? `Cursor X ${cursorWorld.x.toFixed(1)} · Z ${cursorWorld.z.toFixed(1)} m`
          : "Coordenadas em metros"}
      </div>
      <div className="log-draft-points">
        {draft.map((p, i) => (
          <span key={i}>
            P{i + 1} ({p.x.toFixed(1)}, {p.z.toFixed(1)})
          </span>
        ))}
      </div>
      <div className="log-hint">
        {viewOnly
          ? "MODO VISUALIZAÇÃO · CLIQUE PARA SELECIONAR · DOIS CLIQUES PARA ENQUADRAR"
          : (tool === "area"
            ? "CLIQUE ESQUERDO NO PISO PARA DESENHAR A ÁREA"
            : "CLIQUE ESQUERDO NO PISO PARA DESENHAR O CAMINHO") + " · ARRASTE KANBANS COM O CLIQUE ESQUERDO"}
      </div>
      <div className="log-canvas" ref={canvasRef} />
      {tool !== "select" && cursorScreen && (
        <div className="log-crosshair" style={{ left: cursorScreen.x, top: cursorScreen.y }}>
          <i />
          <span>
            X {cursorWorld?.x.toFixed(1)} · Z {cursorWorld?.z.toFixed(1)} m
          </span>
        </div>
      )}
      <div className="log-status">
        <i /> {notice}
      </div>
    </section>
  );
}
