# Wel — Portfólio de Projetos

Portfólio pessoal onde cada projeto roda **ao vivo dentro do site** — nada de
screenshot ou GIF gravado. Você clica no card e mexe na aplicação de verdade.

🔗 [ver o site no ar](#) · feito por **Wel**, montador de sistemas aeronáuticos
na Embraer e estudante de Análise e Desenvolvimento de Sistemas.

---

## Sobre

Esse portfólio nasceu de uma ideia simples: em vez de espalhar protótipos em
repositórios soltos, juntar tudo num único lugar onde cada projeto continua
independente — com seu próprio visual, sua própria lógica — mas é apresentado
de forma consistente, com contexto do problema que ele resolve e das decisões
técnicas por trás.

Os projetos partem, em boa parte, da minha vivência na linha de montagem
estrutural e final da Embraer — interpretação de desenho técnico, torqueamento,
inspeção visual, rastreabilidade — misturada com o que venho estudando em
desenvolvimento de sistemas.

## Projetos

| Projeto | Descrição | Stack |
|---|---|---|
| **[RASTRO](src/projects/rastro)** | Painel de controle de qualidade e rastreabilidade de torque numa linha de montagem aeronáutica, com verificação automática de conformidade | React |
| **[Glass Cockpit](src/projects/glass-cockpit)** | Primary Flight Display simulado — horizonte artificial, piloto automático com física de inércia, avisos de envelope de voo | React + SVG |

Cada projeto tem seu próprio README dentro da pasta, com mais detalhes de
arquitetura e das decisões de design.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como o site é montado

O "casco" (home, navegação, moldura ao redor da demo) usa um visual neutro —
papel claro, grade fina de desenho técnico, azul como único acento — de
propósito, pra não competir com a identidade visual de cada projeto embutido.
Cada projeto mantém seu próprio tema e paleta.

```
src/
  theme.css              tema do casco do site (neutro, tipo prancheta técnica)
  data/projects.js         metadados dos projetos — título, resumo, stack, destaques
  components/
    Nav.jsx, Footer.jsx, ProjectCard.jsx
  pages/
    Home.jsx                grid de projetos
    ProjectPage.jsx          case study + demo ao vivo, carregada sob demanda
  projects/
    rastro/                   projeto completo, isolado, com seu próprio tema
    glass-cockpit/             idem
```

Cada demo é carregada com `React.lazy`, então a home fica leve e o código de
um projeto só baixa quando alguém realmente abre a página dele.

## Adicionando um novo projeto

1. Copie a pasta `src/` do projeto pra dentro de `src/projects/<slug>/`
2. Apague `main.jsx` e `index.html` da cópia — aqui ele roda embutido, não sozinho
3. Adicione uma entrada em `src/data/projects.js`
4. Registre o import preguiçoso em `src/pages/ProjectPage.jsx`:
   ```js
   "novo-slug": lazy(() => import("../projects/novo-slug/App.jsx")),
   ```

## Publicando no GitHub Pages

O GitHub Pages só serve arquivos estáticos — ele não builda o projeto sozinho.
Esse repositório já vem com um workflow (`.github/workflows/deploy.yml`) que
builda e publica automaticamente a cada push na `main`. Pra ativar:

1. No repositório do GitHub, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions** (não "Deploy from a branch")
3. Faça um push na `main` — o workflow builda o projeto e publica sozinho
4. O link fica em **Settings → Pages**, algo como `https://<usuário>.github.io/<repositório>/`

Se preferir publicar manualmente sem o workflow:

```bash
npm run build
```

Isso gera a pasta `dist/` — é o conteúdo dela (não a `src/`) que precisa ir
pro branch/pasta que o Pages está servindo.

## Próximos projetos

- Sistema de peso e balanceamento (weight & balance) com validação de envelope
- MFD de navegação pra acompanhar o Glass Cockpit

## Contato

Fico no LinkedIn e no GitHub — links na home do site.
