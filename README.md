# Portfólio

Site que embute os projetos como demos ao vivo, não como screenshots.

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

```
src/
  theme.css              tokens visuais do "casco" do site — deliberadamente neutros,
                          pra não competir com o tema de cada projeto embutido
  data/projects.js         metadados de cada projeto (título, resumo, stack, destaques)
  components/
    Nav.jsx, Footer.jsx, ProjectCard.jsx
  pages/
    Home.jsx                grid de projetos
    ProjectPage.jsx          case study + demo ao vivo embutida via React.lazy
  projects/
    rastro/                  projeto RASTRO completo (seu próprio theme.css, componentes, etc.)
    glass-cockpit/            projeto Glass Cockpit completo
  App.jsx                    React Router: "/" e "/projetos/:slug"
```

## Como adicionar um projeto novo

1. Copie a pasta `src/` do projeto pra dentro de `src/projects/<slug>/`
2. Apague o `main.jsx` e `index.html` da cópia (não são usados aqui — o projeto
   passa a rodar dentro do `<Demo />` da página, não sozinho)
3. Adicione uma entrada em `src/data/projects.js`
4. Registre o import preguiçoso em `src/pages/ProjectPage.jsx`:
   ```js
   "novo-slug": lazy(() => import("../projects/novo-slug/App.jsx")),
   ```

Cada projeto mantém seu próprio `theme.css` e paleta — o site não impõe nenhum
estilo por cima da demo, só a molduras neutra ao redor dela.
