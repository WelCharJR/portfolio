// Inspeção de um kanban: grade de caixas (A–F x 1–10) e editor da caixa selecionada.
export default function KanbanModal({
  inspected,
  viewOnly,
  selectedSlotId,
  focusedSlotId,
  onClose,
  onSelectSlot,
  onUpdateSlot,
}) {
  const selectedSlot = inspected.slots?.find((s) => s.id === selectedSlotId);
  return (
    <div className="kanban-backdrop" onClick={onClose}>
      <div className="kanban-modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span className="log-eyebrow">INSPEÇÃO DE KANBAN · {inspected.id}</span>
            <h2>{inspected.name}</h2>
            <small>
              Fileiras A–F · posições 1–10 · {inspected.slots.filter((s) => s.code).length} caixas
              ocupadas
            </small>
          </div>
          <button onClick={onClose}>Fechar</button>
        </header>
        <div className="kanban-inspect-body">
          <div className="kanban-rack">
            <div className="kanban-columns">
              {inspected.slots.map((slot) => (
                <button
                  id={"slot-" + slot.id}
                  key={slot.id}
                  className={
                    "kanban-bin " +
                    (slot.code ? "filled" : "empty") +
                    " " +
                    (selectedSlotId === slot.id ? "selected" : "") +
                    " " +
                    (focusedSlotId === slot.id ? "search-hit" : "")
                  }
                  onClick={() => onSelectSlot(slot.id)}
                >
                  <b>{slot.id}</b>
                  <span>{slot.code || "VAZIA"}</span>
                  <small>{slot.code ? slot.qty + " " + slot.unit : "—"}</small>
                </button>
              ))}
            </div>
          </div>
          <aside className="kanban-slot-editor">
            {selectedSlot ? (
              <>
                {viewOnly && <span className="log-eyebrow">MODO VISUALIZAÇÃO · SOMENTE LEITURA</span>}
                <span className="log-eyebrow">CAIXA {selectedSlot.id}</span>
                <h3>{selectedSlot.code || "Nova caixa"}</h3>
                <label>
                  Código
                  <input
                    disabled={viewOnly}
                    value={selectedSlot.code}
                    onChange={(e) => onUpdateSlot("code", e.target.value)}
                    placeholder="Ex.: NAS1097"
                  />
                </label>
                <label>
                  Descrição
                  <input
                    disabled={viewOnly}
                    value={selectedSlot.name}
                    onChange={(e) => onUpdateSlot("name", e.target.value)}
                    placeholder="Ex.: Rebite escareado"
                  />
                </label>
                <label>
                  Quantidade
                  <input
                    type="number"
                    min="0"
                    disabled={viewOnly}
                    value={selectedSlot.qty}
                    onChange={(e) => onUpdateSlot("qty", e.target.value)}
                  />
                </label>
                <label>
                  Unidade
                  <input
                    disabled={viewOnly}
                    value={selectedSlot.unit}
                    onChange={(e) => onUpdateSlot("unit", e.target.value)}
                    placeholder="un"
                  />
                </label>
                <small>
                  Identificação no kanban: {inspected.id} · {selectedSlot.id}
                </small>
              </>
            ) : (
              <p>Selecione uma caixa.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
