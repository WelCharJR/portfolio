# Hover animado nas caixas da logística Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ao passar o mouse numa caixa ocupada do kanban 3D, ela desliza para frente e solta porcas e parafusos.

**Architecture:** Matemática pura em `hoverMotion.js` (testável sem Three.js); efeito 3D em `createHoverFx.js` (pool de peças, tween por caixa); `useHangarScene.js` só detecta a caixa sob o mouse e chama o efeito no laço de render.

**Tech Stack:** React, Three.js já existente, `node:test` (embutido no Node, sem dependências novas).

**Spec:** `docs/superpowers/specs/2026-11-16-logistica-hover-ferragens-design.md`

## Global Constraints

- Não adicionar dependências.
- Não alterar o layout salvo nem o `localStorage`.
- Tempo vem do `setAnimationLoop` / `performance.now()`, nunca de `Date.now()`.
- Não alterar o destaque existente (escala 1,08 e cursor) nem a animação da câmera.
- Constantes do spec: puxada 0,28 (reduzida 0,12), 180 ms, `cubic-bezier(0.23, 1, 0.32, 1)`, 6 peças por disparo, pool de 30, pausa de 600 ms por caixa, vida 1,4 s com fade de 0,35 s, gravidade 9,8, restituição 0,4, passo máximo 50 ms.

## Review Focus

- Hover só com a ferramenta "Selecionar"; arrastar, trocar de ferramenta e `pointerleave` devolvem a caixa.
- Caixa preenchida depois de editar no modal deve disparar (ocupação lida do layout atual).
- Primeiro objeto sob o mouse que não é caixa (pilar) não dispara.
- Passar o mouse varrendo a prateleira não ultrapassa o pool nem cria peças soltas.
- Recriação da cena (mover kanban) não deixa peças ou caixas puxadas para trás; `dispose` limpa tudo.
- `prefers-reduced-motion` e dispositivos sem hover.

---

### Task 1: Matemática pura do movimento

**Files:**
- Create: `src/projects/logistica/scene/hoverMotion.js`
- Create: `src/projects/logistica/scene/hoverMotion.test.js`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces: `cubicBezier(x1,y1,x2,y2) -> (t)=>number`, `easeOut`, `createTween(value=0)`, `valueAt(tween, now)`, `retarget(tween, to, now, duration)`, `spawnBurst(rand, count) -> Piece[]`, `stepPiece(piece, dt, floorY)`, `pieceOpacity(piece)`, `MOTION` (constantes do spec).
- Piece: `{ kind: "nut"|"bolt", x,y,z, vx,vy,vz, rx,ry,rz, sx,sy,sz, age, life }`.

- [ ] Escrever os testes primeiro: curva (0→0, 1→1, monótona, `easeOut(0.25) > 0.5`); `valueAt` antes, no meio e depois do tween; `retarget` no meio parte do valor atual (sem salto) e reverte para 0 suavemente; `stepPiece` reduz `vy` em `g*dt` e integra posição e giro; quica no chão com `vy` invertido e multiplicado por 0,4 e amortece `vx/vz`; para quando a velocidade é pequena; `pieceOpacity` é 1 antes do fade, 0 na vida e linear no meio; `spawnBurst(()=>0, 6)` e `spawnBurst(()=>0.999, 6)` dão 3 porcas e 3 parafusos alternados, com velocidades nos limites do spec.
- [ ] Rodar `node --test src/projects/logistica/scene/hoverMotion.test.js`. Expected: falha porque `hoverMotion.js` não existe.
- [ ] Implementar o mínimo em `hoverMotion.js`.
- [ ] Rodar o mesmo comando. Expected: todos os testes passam, sem avisos.
- [ ] Adicionar `"test": "node --test src/projects/logistica/scene/hoverMotion.test.js src/projects/logistica/scene/createHoverFx.test.js"` em `package.json` quando o segundo arquivo existir (Task 2).
- [ ] Commit.

### Task 2: Efeito 3D com pool de peças

**Files:**
- Create: `src/projects/logistica/scene/createHoverFx.js`
- Create: `src/projects/logistica/scene/createHoverFx.test.js`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Consumes: tudo de `hoverMotion.js`.
- Produces: `createHoverFx(scene, { isFilled(kanbanId, slotId), reducedMotion, enabled }) -> { hover(bin|null, now), update(now), dispose() }`. `bin` é o `THREE.Group` com `userData.slotId` e `userData.kanbanId` criado por `buildKanban`.

- [ ] Escrever os testes primeiro, com Three.js real (`THREE.Scene`, `THREE.Group`), sem renderizador: `hover` seguido de `update` após 180 ms deixa `bin.position.z = base + 0.28`; sair devolve exatamente a `base` e remove o estado; trocar de caixa no meio retarget sem salto; caixa ocupada ativa 6 peças visíveis e caixa vazia ativa 0; `reducedMotion` puxa 0,12 e ativa 0 peças; `enabled: false` não altera nada nem cria objetos na cena; pausa de 600 ms por caixa (segundo disparo antes disso não cria peças); com o pool esgotado (5 disparos em caixas diferentes) o sexto é ignorado; peças ativas ficam invisíveis e voltam ao pool depois da vida; `dispose` remove os objetos da cena e devolve caixas puxadas à posição base.
- [ ] Rodar `node --test src/projects/logistica/scene/createHoverFx.test.js`. Expected: falha porque `createHoverFx.js` não existe.
- [ ] Implementar o mínimo em `createHoverFx.js` (geometrias e materiais compartilhados, material próprio por peça para o fade, objetos marcados com `userData.fx = true`).
- [ ] Rodar `npm test`. Expected: todos os testes das Tasks 1 e 2 passam.
- [ ] Commit.

### Task 3: Integração na cena e verificação

**Files:**
- Modify: `src/projects/logistica/hooks/useHangarScene.js`

**Interfaces:**
- Consumes: `createHoverFx` da Task 2; `layout` do hook (via `useRef` atualizado a cada render para a ocupação).

- [ ] Em `useHangarScene`: `layoutRef`; criar `hoverFx` na cena com `enabled` (hover disponível) e `reducedMotion` lidos de `matchMedia` quando existir; reaproveitar o `hoveredSlot` já calculado em `onMove` (ferramenta "select", sem botão pressionado) e passá-lo a `hoverFx.hover`; `hover(null)` ao entrar em área/caminho, em `onDown` e em `pointerleave`; `draw(time)` chama `hoverFx.update(time)`; `dispose` na limpeza.
- [ ] Teste de integração em DOM simulado (fora do repo, `/tmp/harness`): estender o harness com `matchMedia` e `setAnimationLoop` controláveis e passos de hover. Expected: nos passos anteriores o HTML, o `localStorage` e a câmera continuam idênticos à versão anterior (ignorando objetos `userData.fx`); no passo de hover, a caixa sob o mouse avança 0,28, mantém o destaque de 1,08 e há 6 peças visíveis; sob `area`/`path`, durante arrasto e depois de `pointerleave`, a caixa volta e não há peças novas; com `reducedMotion`, avança 0,12 e não há peças.
- [ ] Rodar `npm test`, `npm run build` e o lint `no-undef`/`no-unused-vars`. Expected: tudo verde; o único apontamento do lint é o `side` já existente em `buildDrawn.js`.
- [ ] Commit.
