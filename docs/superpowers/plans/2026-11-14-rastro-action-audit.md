# Rastro Action Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guardar e exibir quem renovou a calibração e quem resolveu cada não conformidade, incluindo como foi resolvida.

**Architecture:** Usar os formulários já existentes no `Dashboard.jsx` e as ações do reducer em `RastroContext.jsx`. Os novos metadados continuam no estado persistido em `localStorage`; nome em branco usa o perfil demo ativo.

**Tech Stack:** React, reducer existente, armazenamento local do navegador.

**Spec:** `docs/superpowers/specs/2026-11-14-rastro-registro-de-acoes-design.md`

## Global Constraints

- Recurso de demonstração, sem autenticação real ou sincronização.
- Não apagar dados existentes do `localStorage`.
- Reabrir uma não conformidade não apaga os detalhes da última resolução.
- Não adicionar dependências.

## Review Focus

- Nome vazio ou só com espaços deve usar o perfil demo ativo.
- Descrição da resolução vazia ou só com espaços não deve permitir resolver.
- Reabrir e resolver novamente deve manter a descrição da última resolução exibida.
- Dados antigos sem metadados devem continuar renderizando sem erro.
- A renovação deve substituir vencimento e responsável/data da renovação anterior.

---

### Task 1: Registrar auditoria de calibração e não conformidade

**Files:**
- Modify: `src/projects/rastro/screens/Dashboard.jsx`
- Modify: `src/projects/rastro/state/RastroContext.jsx`

**Interfaces:**
- Consumes: perfil demo ativo em `Dashboard({ operadorAtivo })`; estado `ferramentas`, `naoConformidades`, `operadores` e `dispatch` do contexto.
- Produces: ação `RENOVAR_FERRAMENTA` com `{ id, responsavel }`; ação `RESOLVER_NC` com `{ id, responsavel, descricao }`.
- Persisted shapes: `ferramenta.ultimaRenovacao = { responsavel, data }`; `nc.resolucao = { responsavel, descricao, data }`.

- [ ] Abrir formulário de renovação e formulário de resolução pela ação de cada cartão.
- [ ] Renovação: nome opcional; ao confirmar, nome ausente usa `operadorAtivo`; guardar data local e vencimento em 90 dias.
- [ ] Resolução: descrição obrigatória; nome opcional com o mesmo fallback; guardar pessoa, descrição e data.
- [ ] Reabrir apenas altera `status`; exibir e preservar dados da última resolução.
- [ ] Exibir pessoa e data da última renovação e pessoa, data e método da última resolução.
- [ ] Manter a renderização de dados antigos que não tenham esses campos.
- [ ] Executar `npm run build`; esperado: compilação concluída sem erros.
