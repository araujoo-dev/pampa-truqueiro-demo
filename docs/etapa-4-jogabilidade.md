# Sprint 3 — Etapa 4: primeira mão jogável contra o Cuiudo

## Fluxo e estado

Entrar no modo máquina inicia uma mão. Fisher-Yates embaralha uma cópia das 40 cartas usando uma fonte aleatória injetável: 3 ficam com o humano, 3 com o Cuiudo e 34 permanecem reservadas. O catálogo original e os objetos de carta são imutáveis. Valor impresso não é tratado como força.

O engine possui estado privado, consultável por snapshots imutáveis:

- inativa: nenhuma mão em andamento, após criação ou saída.
- aguardando_jogador: aceita somente uma carta realmente presente na mão humana.
- aguardando_cuiudo: bloqueia o humano; aceita uma única resposta da própria mão do adversário.
- mao_encerrada: três pares completos, sem jogadas permitidas.

Cada par contém player e opponent. Os espaços superiores recebem as cartas do Cuiudo e os inferiores as do humano. O estado mantém as cartas restantes e as utilizadas; a interface não decide a validade da jogada nem usa o DOM como fonte de estado. Não há comparação, vencedor, pontuação ou apostas.

O engine incrementa handId ao iniciar ou abandonar uma mão. A resposta automática exige esse identificador. O controlador agenda a escolha do Cuiudo em 850 ms, cancela o timer ao sair ou reiniciar e mantém também uma revisão de callback. Mesmo um callback cancelado que fosse executado não altera a mão atual.

O botão Nova mão aparece apenas no encerramento. Ele limpa as cartas utilizadas, embaralha o catálogo inteiro, redistribui e devolve o turno ao jogador. Menu abandona a mão; retornar à mesa inicia outra.

## Interface e acessibilidade

As cartas humanas são botões nativos. Um clique ou toque joga imediatamente; Tab, Enter e Espaço funcionam sem handlers de teclado duplicados e sem confirmação. Há foco visível, rótulo acessível da carta, feedback de turno com aria-live e bloqueio sincrônico dos botões enquanto o Cuiudo responde.

A animação de entrada é apenas nas novas cartas centrais; cartas anteriores não são animadas novamente. Destaque de hover é limitado a dispositivos com hover. prefers-reduced-motion desativa transições e animações. A interface devolve o foco à mão ou ao botão Nova mão depois da resposta quando apropriado, sem roubar o foco do modal ou de outro controle.

Abertura, menus, bg_menu_partidas.png, configurações, cenário, mesa, retratos, nome Cuiudo, placar e botões de apostas foram preservados. Foram adicionados apenas o feedback do turno e o botão Nova mão. Os envelopes, rotações e proporções das cartas existentes não foram redesenhados. O adversário recebe apenas versos no DOM, sem identificadores ou caminhos das faces ocultas.

As 40 faces e o verso aprovado não foram editados. O metadado do verso passa de preview para approved para registrar a aprovação visual já recebida.

## Módulos

- deck.js: catálogo, cópia ordenada, randomIndex e shuffleDeck. Não depende do DOM.
- game-engine.js: distribuição, mãos, pares, turnos e validações. Não depende de relógio ou interface.
- game-controller.js: início, nova mão, resposta com atraso e abandono; relógio injetável nos testes.
- game-ui.js: SVGs existentes, renderização dos snapshots e eventos dos botões.
- app.js: aciona início/abandono nas transições de navegação. Agora carregado como módulo ES.
- game-config.js: nome do adversário e intervalo de 850 ms.

## Testes e resultados

26 testes Node aprovados:

- Sete verificações anteriores do catálogo, arquivos e SHA-256 das 40 faces.
- Fisher-Yates determinístico com 39 sorteios, preservação das 40 cartas e validação da fonte aleatória.
- Distribuição 3+3+34 e integridade das identidades durante toda a mão.
- Cartas inexistentes, do adversário, reservadas ou já usadas rejeitadas.
- Bloqueio por turno e resposta única do Cuiudo, usando somente sua própria mão.
- Encerramento com seis cartas, snapshots imutáveis, abandono e reinício.
- 100 mãos consecutivas no engine e 20 mãos completas pelo controlador usando Nova mão.
- Relógio falso: timers cancelados, callbacks antigos forçados e reinício durante espera sem resposta indevida.

Integração Chromium/Playwright aprovada em seis resoluções: 1600 × 736, 390 × 844, 320 × 640, 844 × 390, 568 × 320 e 1280 × 720.

- Mão completa com mouse, toque e teclado; navegação por Tab e foco visível.
- Retirada da carta, exibição no par correto, bloqueio de eventos repetidos, resposta automática e seis identidades únicas no centro.
- Nova mão sem recarregar, estado limpo e três versos no adversário.
- Saída durante espera e retorno, com verificações usando também o relógio real.
- Configurações durante a resposta do Cuiudo, sem perda de funcionalidade.
- Todas as 41 imagens decodificadas; nenhuma falha HTTP local ou exceção JavaScript.
- Movimento reduzido emulado; ausência de transbordamento horizontal ou sobreposição entre Nova mão e o feedback do turno.
- Comparação de abertura, menu e modos com a main abc0e65, sem diferenças em desktop e celular. Cenário e controles da mesa também comparados, ocultando somente as camadas alteradas pela jogabilidade (mãos, cartas centrais, feedback e Nova mão).
- Verificação de sintaxe dos módulos e git diff --check.

O navegador de testes usa --disable-gpu para comparação estável e bloqueia a fonte externa do Google Fonts em ambas as versões. A experiência móvel foi testada por emulação, não em aparelho físico. O algoritmo usa Math.random em produção; fontes controladas são injetadas apenas nos testes de lógica.

Capturas em docs/capturas/etapa4-jogada-desktop.png, etapa4-fim-desktop.png, etapa4-jogada-celular.png e etapa4-fim-celular.png.

## Limites

Esta versão sempre executa três jogadas por participante; não apura vencedor de rodada ou mão, não atualiza o placar e não implementa Truco, Retruco, Vale Quatro, Envido, Flor, estratégia avançada ou multiplayer. Os botões dessas ações permanecem desabilitados. A próxima etapa depende de avaliação e autorização.

Veja o README para execução por Live Server/Python e comandos de teste.
