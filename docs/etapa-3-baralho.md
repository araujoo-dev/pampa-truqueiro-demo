# Sprint 3 — Etapa 3: catálogo e integração das cartas

## Escopo entregue

- Catálogo com 40 cartas: Espadas, Bastos, Copas e Ouros; valores 1–7, 10, 11 e 12.
- Cada registro possui id, naipe, valor e imagem. Valores são números impressos, não a força da carta no Truco.
- createDeck retorna uma nova coleção ordenada; não embaralha ou distribui. Registros do catálogo são imutáveis.
- js/card-assets.js concentra os caminhos e os enquadramentos. O naipe lógico bastos usa os arquivos paus-*, conforme autorizado.
- js/game-ui.js exibe três faces fixas: espadas-1, copas-7 e ouros-12. Três versos no adversário e um no monte decorativo.
- Nenhum evento de jogada, sorteio, turno, IA, pontuação ou regra foi implementado.

## Preservação das artes e da interface

As 40 faces são idênticas byte a byte às recebidas. As assinaturas SHA-256 estão em tests/fixtures/official-card-hashes.json e são verificadas pelos testes. Existem 39 faces de 1280 × 1280 e espadas-1 de 1408 × 1408.

As imagens contêm margens transparentes e diferentes posições da carta dentro do arquivo quadrado. O renderer usa SVG com viewBox e preserveAspectRatio="xMidYMid meet" para enquadrar o desenho completo em escala uniforme, sem reexportar, redimensionar ou sobrescrever os PNGs. Inclui os pequenos detalhes que ultrapassam o retângulo principal da carta.

Espadas-1 e as faces de valor 11 têm pequenos quadrados isolados no ponto (0,0), separados da carta, decorrentes da exportação. Esses resíduos ficam fora do enquadramento visual, mas permanecem nos arquivos. O teste de pixels verifica que nenhum desenho fora dessa região residual (11 × 11 no canto da imagem) é excluído. Não há cortes nas figuras, números ou detalhes da carta.

As caixas, posições e rotações existentes da mesa foram mantidas. O monte apenas gira a arte em 90° dentro da caixa horizontal. Menus, bg_menu_partidas.png, configurações, cenário, retratos, controles e placar não foram alterados. Não há botão de confirmação de jogada.

## Prévia do verso — aprovação pendente

assets/cards/verso.png é uma proposta original criada com geração de imagem. A exportação técnica foi feita em canvas 1280 × 1280, com escala de vizinho mais próximo e sem suavização. A metade superior da arte é repetida em rotação de 180° na metade inferior, garantindo simetria exata dos pixels. O fundo é totalmente opaco; o retângulo visual da carta é 560 × 880, de proporção próxima às faces oficiais, centralizado no canvas. O viewBox exibe somente esse retângulo, sem deformação.

A bandeira e o brasão são uma interpretação em pixel art: verde, vermelho, amarelo, escudo, barrete, armas e ramos, com moldura dourada ornamentada. Não se afirma reprodução heráldica exata. A equipe ainda precisa aprovar a fidelidade e o acabamento; o asset está identificado como preview no catálogo e não é considerado definitivo. Para revisar a arte futuramente, basta substituir verso.png e, se necessário, atualizar seu enquadramento no mapeamento central.

## Validação

- Sete testes Node: contagem e unicidade; naipes e valores; mapeamento; arquivos presentes; SHA-256 das 40 faces; dimensões/enquadramentos; independência das coleções e imutabilidade.
- Browser Chromium/Playwright: carregamento e decodificação das 40 faces e do verso; conferência dos três IDs fixos; três versos no adversário; nenhuma jogada por clique/toque; reabertura preserva cartas fixas.
- Verificação pixel a pixel de ausência de cortes na arte das faces e de opacidade/simetria do verso.
- Abertura, menus, modo local, ida/volta à mesa e configurações no menu e na partida.
- Desktop 1600 × 736, celular 390 × 844, pequeno 320 × 640, paisagem 844 × 390, paisagem pequena 568 × 320 e notebook 1280 × 720.
- Comparação com o checkout f6c5121 em desktop e celular: telas anteriores idênticas; mesa idêntica quando as camadas das cartas são ocultadas nos dois lados. As mensagens temporárias também são ocultadas na comparação da mesa para não comparar instantes diferentes de suas transições.
- Sem transbordamento horizontal, sem falhas HTTP locais e sem exceções JavaScript nas interações verificadas.
- node --check para os módulos e git diff --check.

O Chromium é executado com --disable-gpu para tornar a rasterização comparativa determinística (o modo padrão apresentou pequenas diferenças de antialiasing na borda inferior, sem alterações de geometria). A fonte externa do Google Fonts é bloqueada no navegador de teste em ambas as versões para não depender de rede; os testes móveis usam emulação, não aparelhos físicos. Capturas estão em docs/capturas/etapa3-desktop.png e etapa3-celular.png.

Para executar, use Live Server no VS Code ou python -m http.server 8000 na pasta do projeto. Módulos ES exigem HTTP, não file://. Consulte o README para executar os testes.
