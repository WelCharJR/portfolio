# Hover animado nas caixas do kanban (logística)

## Intenção

Ao passar o mouse sobre uma caixa ocupada da estante 3D, ela desliza um pouco para frente e solta porcas e parafusos. O objetivo é deixar a visualização do hangar mais viva e divertida na demonstração do portfólio.

## Abordagens

- **Peças 3D com física simples (escolhida):** malhas pequenas reaproveitadas de um pool, movidas no próprio laço de render. Sem dependências novas.
- **Biblioteca de partículas:** descartada; traria uma dependência para apenas 6 peças.
- **CSS/DOM:** não serve; a cena é um canvas WebGL.

## Comportamento

- Só reage com a ferramenta "Selecionar", sem arrastar nem orbitar. Ao começar a arrastar, trocar de ferramenta ou o mouse sair do canvas, a caixa volta.
- **Convive com o destaque que já existe:** a caixa sob o mouse continua crescendo 1,08× e o cursor continua virando mão. A puxada e as peças são acrescentadas a isso, e a detecção reaproveita o `hoveredSlot` que `onMove` já calcula, sem segundo raycast.
- Só caixas ocupadas (com código) reagem. A ocupação é lida do layout mais recente, não da cena, porque adicionar ou editar itens não recria a cena.
- Se o primeiro objeto sob o mouse não for uma caixa (por exemplo, um pilar da estante), nada reage.
- **Puxada:** a caixa avança 0,28 em z (frente) em 180 ms com `cubic-bezier(0.23, 1, 0.32, 1)`. Ao mudar o alvo (entrar, sair ou trocar de caixa no meio do movimento), a animação parte do valor atual, sem salto.
- **Peças:** 6 por disparo (3 porcas hexagonais e 3 parafusos), maiores que o real para aparecerem com o zoom normal (porca com raio 0,09). Nascem na borda frontal superior da caixa puxada, sobem, giram, caem com gravidade (9,8), quicam uma vez no chão (restituição 0,4) e somem com fade nos últimos 0,35 s de uma vida de 1,4 s.
- **Controle de excesso:** cada caixa tem pausa de 600 ms entre disparos; há um pool fixo de 30 peças e, sem 6 livres, o disparo é ignorado.
- **Acessibilidade e dispositivos:** com `prefers-reduced-motion: reduce` a caixa se move 0,12 e não há peças. Sem hover (toque), o efeito fica desligado.
- O tempo vem do `setAnimationLoop` do renderer (mesma escala de `performance.now()`); o passo de tempo é limitado a 50 ms para abas que voltam do segundo plano.

## Limites

- Não altera dados do layout nem o `localStorage`.
- Não corrige a cor da caixa no 3D após editar um item (problema anterior, fora deste escopo).
- As preferências do sistema são lidas quando a cena é criada, não acompanham mudanças durante a sessão.

## Arquivos previstos

- `src/projects/logistica/scene/hoverMotion.js`: matemática pura (curva, tween com retarget, física das peças, disparo), sem Three.js.
- `src/projects/logistica/scene/createHoverFx.js`: efeito 3D (pool de peças, caixas puxadas, `hover`, `update`, `dispose`).
- `src/projects/logistica/hooks/useHangarScene.js`: detecção da caixa sob o mouse, ligação ao laço de render e limpeza.
- Testes ao lado dos módulos, com `node --test`.

## Verificação

- Testes automatizados da matemática e do efeito 3D com Three.js real, sem renderizador.
- Teste de integração em DOM simulado (fora do repositório) comparando com a versão anterior e exercitando hover, arrasto, ferramentas e saída do canvas.
- `npm run build` e lint de variáveis indefinidas.
