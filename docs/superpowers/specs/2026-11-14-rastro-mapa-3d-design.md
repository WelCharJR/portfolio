# Mapa 3D de operações do Rastro

## Intenção

Dar uma visão geral e interativa de onde os registros de operação do Rastro se relacionam com o avião. A demo não pretende representar localização de precisão nem operação real.

## Abordagens

- **Importar o GLB e adicionar marcadores 3D (escolhida):** usar o modelo Narrow-Body Airliner da Polyfork via Three.js, com marcadores próprios ancorados em zonas aproximadas. Reaproveita o modelo provisório escolhido e mantém os marcadores alinhados quando a pessoa gira o avião.
- **Construir o avião com geometria no código:** dispensa arquivo externo, mas exigiria modelagem e acabamento adicionais; não aproveita o GLB aprovado.
- **Exibir a cena externa em iframe:** menos controle visual e integração com os registros React; não permite ligar os marcadores ao estado local de forma confiável.

## Escopo da primeira etapa

- Adicionar uma aba `Mapa 3D` no painel do Rastro.
- Renderizar o GLB Narrow-Body Airliner escolhido. Permitir girar e aproximar/afastar o modelo.
- Selecionar aeronave e zona clicando nas próprias peças coloridas do modelo; a asa inteira é a área principal e o trem de pouso é outra zona.
- Ao selecionar a asa, oferecer flaps, ailerons e spoilers como peças menores clicáveis e atividades independentes.
- Associar pontos já existentes às zonas: longarina, nervura e painel à asa; trem de pouso ao trem de pouso.
- Ao selecionar uma zona, mostrar registros de operação correspondentes, incluindo data, ponto, ferramenta e operador.
- Permitir iniciar e encerrar manualmente uma atividade na zona selecionada. A atividade usa o perfil demo ativo como responsável e registra início e encerramento.
- Mostrar no mapa quais zonas têm uma atividade em andamento e quem a iniciou. Permitir no máximo uma atividade em andamento por aeronave e zona.
- Manter as atividades de zona separadas dos registros concluídos de torque; iniciar/encerrar atividade não cria nem altera um registro de torque.
- Exibir estado vazio claro para zonas sem registros.
- Usar o estado local existente; não requerer dados reais de férias ou substituição nesta etapa.
- Avisar visualmente que os marcadores são esquemáticos.

## Limites e pressupostos

- O Rastro atualmente guarda operações registradas, sem estado de trabalho em andamento. O mapa representa operações registradas por zona e aeronave, e não afirma que um processo está ocorrendo neste instante.
- Os dados atuais não têm coordenadas exatas. A área geral destacada na asa é aproximada; o modelo genérico não separa sua pele, longarinas ou nervuras.
- Uma atividade em andamento só aparece depois de alguém iniciá-la manualmente no mapa; o sistema não infere atividade real.
- Atividades e seus horários são dados de demonstração locais, não apontamentos operacionais reais.
- O modelo GLB é um narrow-body genérico, não a representação exata de um E175/E195; será substituído quando houver um modelo fornecido pela empresa.
- Férias, disponibilidade e sugestões de substitutos ficam para uma etapa posterior.
- Não alterar dados de produção ao apenas visualizar o mapa.

## Implementação proposta

- Componente React isolado para criar e limpar renderer, cena, carregador GLB, controles de órbita e eventos de clique.
- Uma camada pequena de dados associa os IDs dos pontos de fixação às zonas visuais; manter essa regra fora da geometria do modelo.
- Usar Three.js com GLTFLoader e OrbitControls; sem framework 3D React adicional.
- Carregar o arquivo dentro do próprio projeto para não depender de um CDN em tempo de execução.

## Verificação

- Confirmar que a compilação de produção termina sem erros.
- Verificar manualmente a carga do GLB, rotação/zoom, seleção de marcadores e filtro de registros por aeronave/zona.

