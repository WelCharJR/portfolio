# Wel — Portfólio de Projetos

Portfólio pessoal onde cada projeto roda **ao vivo, dentro do próprio site** —
nada de screenshot ou GIF gravado. Você abre o projeto e usa a aplicação de
verdade, no navegador.

🔗 **[ver o site no ar](#)**
💼 [LinkedIn](#) · 💻 [GitHub](#)

---

## Sobre mim

Sou **Wel**, montador de sistemas aeronáuticos na Embraer (apprentice, 2024–2026,
via Senai) e estudante de Análise e Desenvolvimento de Sistemas no Senac.

Os projetos deste portfólio nascem, em boa parte, da minha vivência na linha de
montagem estrutural e final — interpretação de desenho técnico, torqueamento,
cablagem, inspeção visual, rastreabilidade — unida ao que venho estudando em
desenvolvimento de software. A ideia é mostrar não só código, mas domínio real
do problema que cada aplicação resolve.

## Projetos

| Projeto | Descrição | Stack |
|---|---|---|
| **[RASTRO](src/projects/rastro)** | Painel de controle de qualidade e rastreabilidade de torque numa linha de montagem aeronáutica, com verificação automática de conformidade e abertura de não conformidades | React, Framer Motion |
| **[Glass Cockpit](src/projects/glass-cockpit)** | Primary Flight Display simulado — horizonte artificial, piloto automático com física de inércia, avisos de envelope de voo | React, SVG |
| **[DMAIC — Green Belt](src/projects/dmaic)** | Case de melhoria contínua aplicando o ciclo DMAIC completo à redução de não conformidade de torque (Cpk, Ishikawa, Pareto, FMEA) | React, SVG |
| **[Weapons Display](src/projects/weapons-display)** | Radar tático com guiamento por navegação proporcional em tempo real e um alvo controlado por IA que se defende sozinho | React, SVG |
| **[OPT](src/projects/opt)** | CDU simulado calculando V-speeds, peso limitado pela pista e flap recomendado para decolagem, em 7 aeronaves reais | React |

Cada card do site traz um resumo do problema, das decisões técnicas e dos
destaques do projeto.

## Stack

React (Vite) · Framer Motion · SVG · CSS custom properties — cada projeto
mantém sua própria identidade visual dentro de um "casco" neutro, de propósito,
para não competir com o tema de cada demo.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Contato

Fico no LinkedIn e no GitHub — links no topo deste README e na home do site.
