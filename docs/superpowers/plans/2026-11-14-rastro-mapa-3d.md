# Mapa 3D do Rastro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a schematic, interactive 3D aircraft map to Rastro that links aircraft zones to completed operations and manually tracked active work.

**Architecture:** Store active and completed zone activity sessions in the existing local Rastro reducer and persistence. Add an isolated Three.js viewer that loads a local GLB, displays clickable approximate zone markers, and renders a React details panel; integrate it as a Dashboard tab.

**Tech Stack:** React 18, Three.js GLTFLoader and OrbitControls, Vite, existing localStorage reducer.

**Spec:** `docs/superpowers/specs/2026-11-14-rastro-mapa-3d-design.md`

## Global Constraints

- The map is a schematic demo and must label approximate locations.
- Active work is started and ended manually, using the active demo operator.
- Allow at most one active session per aircraft and zone.
- Activity sessions stay separate from completed torque records.
- Load the chosen generic Narrow-Body Airliner GLB from the project, not a runtime CDN.
- Do not represent vacation, staffing, or exact operational location data.

## Review Focus

- Existing localStorage data without activity sessions must load without loss.
- Starting twice for the same aircraft and zone must not create duplicate active sessions.
- Ending a session must preserve its operator and timestamps as history.
- Filtering operations must match the selected aircraft and schematic zone.
- The viewer must release its renderer and event resources when unmounted.

---

### Task 1: Persist demo activity sessions

**Files:**
- Modify: `src/projects/rastro/state/RastroContext.jsx`

**Interfaces:**
- Consumes: existing reducer actions and localStorage state.
- Produces: state field `atividades`, action `INICIAR_ATIVIDADE` with `{ aeronaveSerie, zonaId, operador }`, and action `ENCERRAR_ATIVIDADE` with `{ id }`.

- [x] Add `atividades: []` to seed and migration defaults.
- [x] Implement start action with unique session ID, zone, aircraft, operator, `iniciadaEm`, and null `encerradaEm`; return unchanged state if a matching active session exists.
- [x] Implement end action that sets `encerradaEm` only for the matching active session.
- [x] Review migration and reducer branches to confirm prior state fields and records remain intact.

### Task 2: Build local 3D map and connect Dashboard

**Files:**
- Create: `src/projects/rastro/components/AeronaveMapa3D.jsx`
- Modify: `src/projects/rastro/screens/Dashboard.jsx`
- Modify: `package.json` and lockfile
- Add: `public/models/rastro/narrow-body-airliner.glb`

**Interfaces:**
- Consumes: `aeronaves`, `pontos`, `operacoes`, `atividades`, `operadorAtivo`, and reducer dispatch.
- Produces: an interactive map tab with aircraft and zone selectors, schematic markers, active-session controls, and filtered completed operation history.

- [x] Add Three.js as a runtime dependency and place the approved GLB in `public/models/rastro/`.
- [x] Create a viewer component that loads the model with GLTFLoader, adds approximate wing and landing-gear markers, and supports orbit and zoom.
- [x] Dispose renderer, controls, and event listeners when the viewer unmounts.
- [x] Map existing point labels to wing or landing-gear zones and filter history by aircraft and zone.
- [x] Show the active operator and start time for active sessions; enable start/end with the current demo operator and keep completed sessions in history.
- [x] Add `Mapa 3D` to Dashboard tabs and mount the component only while that tab is selected.
- [x] Run `npm run build` and review the changed files for data migration, resource cleanup, and accessibility.

