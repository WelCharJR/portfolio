import { useState } from "react";
import { pathTypes } from "../constants.js";

// Painel lateral: busca de material, lista de itens do layout e detalhes do item selecionado.
export default function SidePanel({
  layout,
  viewOnly,
  selected,
  query,
  selectedSlotId,
  onQuery,
  onAddItem,
  onRemoveItem,
  onRenameKanban,
  onRotateKanban,
  onExportBackup,
  onImportBackup,
  onSelect,
  onOpenKanban,
  onNotice,
  onPathWidth,
  onRemove,
}) {
  const searchResults = query.trim()
    ? layout.kanbans.flatMap((k) =>
        (k.slots || [])
          .filter(
            (s) =>
              s.code &&
              (s.code + " " + s.name)
                .toLocaleLowerCase()
                .includes(query.trim().toLocaleLowerCase()),
          )
          .map((s) => ({ kanban: k, slot: s })),
      )
    : [];
  const [kanbanId, setKanbanId] = useState(layout.kanbans[0]?.id || "");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("10");
  const [unit, setUnit] = useState("un");
  const [slotChoice, setSlotChoice] = useState("next");
  const inventory = layout.kanbans.flatMap((kanban) => kanban.slots.filter((slot) => slot.code).map((slot) => ({kanban, slot})));
  const submitItem = (e) => { e.preventDefault(); if (!code.trim()) return; onAddItem({kanbanId, slotId:slotChoice === "next" ? null : slotChoice, code:code.trim(), name:name.trim(), qty:Math.max(0,Number(qty)||0), unit:unit.trim()||"un"}); setCode(""); setName(""); };
  const currentPath = layout.paths.find((x) => x.id === selected);
  const current = layout.kanbans.find((k) => k.id === selected);
  return (
    <aside className={viewOnly ? "log-panel view-only" : "log-panel"}>
      <span className="log-eyebrow">{viewOnly ? "VISUALIZAÇÃO · SOMENTE LEITURA" : "LAYOUT DO HANGAR"}</span>
      <div className="log-search">
        <label htmlFor="log-search-input">LOCALIZAR MATERIAL</label>
        <input
          id="log-search-input"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Código ou descrição"
        />
        {query.trim() && (
          <div className="log-search-results">
            {searchResults.length ? (
              searchResults.slice(0, 8).map(({ kanban, slot }) => (
                <button
                  key={kanban.id + "-" + slot.id}
                  onClick={() => {
                    onOpenKanban(kanban.id, slot.id);
                    onNotice(slot.code + " · " + kanban.id + " · caixa " + slot.id);
                  }}
                >
                  <b>{slot.code || "Sem código"}</b>
                  <span>{slot.name || "Sem descrição"}</span>
                  <small>
                    {kanban.id} · {kanban.name} · {slot.id} · {slot.qty} {slot.unit}
                  </small>
                </button>
              ))
            ) : (
              <small>Nenhum material encontrado.</small>
            )}
          </div>
        )}
      </div>
      <section className="inventory-manager">
        <span className="log-eyebrow">GERENCIAR MATERIAIS</span>
        <form onSubmit={submitItem}>
          <select value={kanbanId} onChange={e=>setKanbanId(e.target.value)} aria-label="Kanban de destino">{layout.kanbans.map(k=><option key={k.id} value={k.id}>{k.id} · {k.name}</option>)}</select>
          <select value={slotChoice} onChange={e=>setSlotChoice(e.target.value)} aria-label="Caixa de destino"><option value="next">Próxima caixa livre</option>{layout.kanbans.find(k=>k.id===kanbanId)?.slots.filter(s=>!s.code).map(s=><option key={s.id} value={s.id}>{s.id}</option>)}</select>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Código do item" aria-label="Código do item" required />
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Descrição" aria-label="Descrição" />
          <div><input type="number" min="0" value={qty} onChange={e=>setQty(e.target.value)} aria-label="Quantidade"/><input value={unit} onChange={e=>setUnit(e.target.value)} aria-label="Unidade"/></div>
          <button type="submit">Adicionar à próxima caixa livre</button>
        </form>
        <div className="backup-actions"><button type="button" onClick={onExportBackup}>Exportar backup</button><label>Restaurar backup<input type="file" accept=".json,application/json" onChange={(e)=>{const file=e.target.files?.[0];if(file)onImportBackup(file);e.target.value="";}} /></label></div>
        <div className="inventory-list">{inventory.map(({kanban,slot})=><div key={kanban.id+slot.id}><span><b>{slot.code}</b><small>{kanban.id} · {slot.id} · {slot.qty} {slot.unit}</small></span><button aria-label={"Remover "+slot.code+" de "+slot.id} onClick={()=>onRemoveItem(kanban.id,slot.id)}>×</button></div>)}</div>
      </section>
      <strong>
        {layout.kanbans.length} kanbans · {layout.areas.length} áreas · {layout.paths.length}{" "}
        caminhos
      </strong>
      <div className="log-list">
        {layout.kanbans.map((k) => (
          <button
            className={selected === k.id ? "active" : ""}
            key={k.id}
            onClick={() => onSelect(k.id)}
          >
            <span className="log-dot" />
            <span>
              <b>{k.name}</b>
              <small>
                {k.id} · {k.slots.filter((s) => s.code).length} caixas ocupadas
              </small>
            </span>
          </button>
        ))}
        {layout.areas.map((a) => (
          <button
            className={selected === a.id ? "active" : ""}
            key={a.id}
            onClick={() => onSelect(a.id)}
          >
            <span className="log-dot area" />
            <span>
              <b>{a.name}</b>
              <small>
                {a.id} · área · {a.points.length} vértices
              </small>
            </span>
          </button>
        ))}
        {layout.paths.map((a) => (
          <button
            className={selected === a.id ? "active" : ""}
            key={a.id}
            onClick={() => onSelect(a.id)}
          >
            <span className="log-dot path" />
            <span>
              <b>{a.name}</b>
              <small>
                {a.id} · {pathTypes[a.type]?.label || "Rota logística"} · {a.width} m
              </small>
            </span>
          </button>
        ))}
      </div>
      {current && (
        <div className="log-detail">
          <span className="log-eyebrow">KANBAN SELECIONADO</span>
          <label className="kanban-rename">Nome do kanban<input value={current.name} onChange={e=>onRenameKanban(current.id,e.target.value)} /></label>
          <div className="kanban-rotation"><span>Orientação · {current.rotation||0}°</span><div><button type="button" aria-label="Girar kanban 15 graus para a esquerda" onClick={()=>onRotateKanban(current.id,-15)}>↶ 15°</button><button type="button" aria-label="Girar kanban 15 graus para a direita" onClick={()=>onRotateKanban(current.id,15)}>↷ 15°</button></div></div>
          <div className="log-item">
            <span>Caixas ocupadas</span>
            <b>
              {current.slots.filter((s) => s.code).length}/{current.slots.length}
            </b>
          </div>
          <button className="log-inspect" onClick={() => onOpenKanban(current.id, selectedSlotId)}>
            Ampliar e ver caixas
          </button>
        </div>
      )}
      {currentPath && (
        <div className="log-detail">
          <span className="log-eyebrow">CAMINHO SELECIONADO</span>
          <h3>{currentPath.name}</h3>
          <small>{pathTypes[currentPath.type]?.label || "Rota logística"}</small>
          <label className="log-width">
            Largura{" "}
            <input
              type="number"
              min=".2"
              max="4"
              step=".1"
              value={currentPath.width}
              onChange={(e) => onPathWidth(currentPath.id, Number(e.target.value))}
            />{" "}
            m
          </label>
          <button className="log-delete" onClick={onRemove}>
            Remover caminho
          </button>
        </div>
      )}
      {layout.areas.some((a) => a.id === selected) && (
        <div className="log-detail">
          <span className="log-eyebrow">ÁREA SELECIONADA</span>
          <h3>{layout.areas.find((a) => a.id === selected)?.name}</h3>
          <button className="log-delete" onClick={onRemove}>
            Remover área
          </button>
        </div>
      )}
      <small className="log-local">● Dados salvos localmente neste navegador</small>
    </aside>
  );
}
