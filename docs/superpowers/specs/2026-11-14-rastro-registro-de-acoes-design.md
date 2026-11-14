# Registro de responsáveis e ações no Rastro

## Intenção

Registrar quem realizou renovações de calibração e resoluções de não conformidades, e descrever como cada pendência foi resolvida, para facilitar a demonstração e a depuração.

## Abordagens

- **Perfil ativo automático:** sempre atribuir a ação ao operador selecionado; simples, mas não permite registrar outra pessoa.
- **Pergunta em cada ação (escolhida):** abrir um formulário em cada renovação ou resolução. Se o nome ficar vazio, usar o perfil demo ativo como responsável, tratado pela demo como dono da conta.

## Escopo e comportamento

- Na renovação da calibração, pedir opcionalmente o nome de quem fez a renovação. Campo vazio usa o operador demo ativo. Salvar responsável, data e novo vencimento de 90 dias.
- Ao resolver uma não conformidade, pedir opcionalmente quem resolveu e obrigatoriamente como foi resolvida. Campo de responsável vazio usa o operador demo ativo. Salvar responsável, descrição, data e status resolvido.
- Mostrar os dados de auditoria nos cartões correspondentes. Reabrir uma não conformidade muda o status, sem apagar os dados da resolução anterior.
- Preservar a compatibilidade com os dados de demonstração já gravados no `localStorage`; registros antigos podem não ter os novos campos.

## Limites

- Dados continuam locais ao navegador, coerentes com a demo atual.
- Não adicionar autenticação real, sincronização, trilha imutável ou fluxo operacional real.

## Arquivos previstos

- `src/projects/rastro/screens/Dashboard.jsx`: janelas e campos de confirmação; exibição do responsável e detalhes.
- `src/projects/rastro/state/RastroContext.jsx`: ações do reducer para gravar renovação e resolução sem descartar metadados ao reabrir.

## Verificação

- Confirmar com testes que renovação e resolução usam o nome informado ou o operador ativo de reserva; resolução também exige a descrição; reabertura mantém os dados anteriores.
- Rodar a compilação de produção.
