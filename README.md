# Pampa Truqueiro — Truco Gaúcho

Primeira experiência jogável em HTML, CSS e JavaScript: jogue três cartas contra o Cuiudo e inicie novas mãos. As rodadas ainda não têm vencedor ou pontuação; Truco, Envido e Flor permanecem desabilitados.

## Executar localmente

No VS Code, abra a pasta do projeto, instale **Live Server** (Ritwick Dey) e escolha **Open with Live Server** em `index.html`.

Alternativamente, com Python 3, execute na pasta do projeto:

```sh
python -m http.server 8000
```

Abra `http://localhost:8000` no seu computador. Encerre o servidor com Ctrl+C. Use HTTP: abrir o HTML por `file://` não carrega os módulos ES. A aplicação não exige instalação de pacotes ou build.

A fonte Press Start 2P usa Google Fonts; sem acesso à rede, os menus usam a alternativa monoespaçada já prevista no projeto.

## Como jogar esta versão

1. Entre pela abertura, selecione Iniciar e o modo contra a máquina.
2. Cada participante recebe três cartas distintas; o humano sempre começa.
3. Clique/toque diretamente numa carta ou use Tab e Enter/Espaço. Não há confirmação.
4. A carta sai da mão e aparece no centro. Durante os 850 ms de resposta do Cuiudo, as outras cartas ficam bloqueadas.
5. Após os três pares, as seis cartas continuam visíveis. Use **Nova mão** para repetir sem recarregar a página.
6. **Menu** abandona a mão e cancela a resposta pendente; retornar à mesa inicia outra mão.

As cartas do Cuiudo permanecem ocultas até serem jogadas. O modo local continua em construção. As configurações mantêm o comportamento anterior: os controles podem ser alterados, mas Salvar apenas fecha o modal e exibe a mensagem, sem persistência ou áudio implementado.

## Organização

- `index.html`: telas, mesa, modal e controles.
- `css/styles.css`: aparência original dos menus.
- `css/game.css`: mesa e feedback de jogabilidade, incluindo movimento reduzido.
- `js/app.js`: navegação e configurações.
- `js/deck.js`: catálogo de 40 cartas, consulta e Fisher-Yates com aleatoriedade injetável.
- `js/card-assets.js`: caminhos e enquadramentos das artes, separados da lógica.
- `js/game-engine.js`: estado privado da mão, distribuição e validação dos turnos, sem DOM ou relógio.
- `js/game-controller.js`: coordenação de respostas automáticas e cancelamento dos temporizadores.
- `js/game-ui.js`: cartas, eventos nativos dos botões e apresentação do estado.
- `js/game-config.js`: nome Cuiudo e atraso de resposta.
- `assets/cards/`: 40 faces oficiais e o verso gaúcho aprovado, todos preservados.
- `tests/`: testes unitários, integração no navegador e assinaturas das artes oficiais.

Bastos é o nome lógico; os arquivos `paus-*` permanecem intactos. O SVG de enquadramento respeita as proporções e compensa as margens de exportação sem alterar os PNGs. Para trocar futuramente os retratos, os caminhos são `assets/characters/player.png` e `opponent.png`; o nome do adversário está centralizado em `js/game-config.js`.

## Testes

Com Node.js 22.7 ou superior:

```sh
node --test tests/deck.test.mjs tests/game.test.mjs
```

Com Playwright e Chromium disponíveis no ambiente de testes, e o servidor HTTP na porta 8000:

```sh
BASE_URL=http://127.0.0.1:8000 node tests/cards-browser.cjs
```

O executável padrão é `/usr/bin/chromium`; use `CHROMIUM_PATH` para outro caminho. `CAPTURE_DIR` escolhe a pasta das capturas, cujo padrão é `/tmp/pampa-etapa4-capturas`. `BASELINE_URL`, opcional, habilita a comparação com um checkout anterior servido por HTTP. Essas ferramentas são usadas apenas nos testes, não no funcionamento da aplicação.

Veja [a arquitetura e a validação da Etapa 4](docs/etapa-4-jogabilidade.md). O histórico visual permanece em [Etapa 2](docs/revisao-visual-etapa-2.md) e [Etapa 3](docs/etapa-3-baralho.md).
