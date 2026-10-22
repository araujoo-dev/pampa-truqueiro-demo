# Correção da seleção de modos — Etapa 4

Registro histórico: esta primeira correção foi substituída pelo [ajuste de menus com a mesma arte](menus-mesma-arte.md). A interface atual compartilha menu.png e troca somente as regiões de rótulo.

## Causa e histórico

O commit dbfbfd3 (Atualiza menu de selecao de partidas) adicionou assets/backgrounds/bg_menu_partidas.png e trocou a referência de modeFrame, que antes usava mode.png. A nova imagem contém o menu principal com os nomes Tchêco e Priscila, não os rótulos de seleção de modos. Os botões do HTML eram hotspots transparentes, dependentes dos textos desenhados na imagem; assim, as áreas clicáveis continuaram presentes sem os botões corretos visíveis.

A navegação de app.js já apontava para modeScreen e depois gameScreen; o problema era a apresentação da seleção, não a lógica de entrada na partida. Os testes anteriores verificavam os cliques e comparavam com uma base que já continha a imagem incorreta, sem exigir os rótulos visíveis. Essa lacuna foi corrigida.

A arte correta mode.png foi introduzida em 363554e e continua intacta no repositório. A referência a ela foi restaurada. Os dois controles agora são botões HTML visíveis, com os textos 1v1 e 1vMáquina, cobrindo as áreas das opções na arte original. O botão Voltar permanece; em celular vertical possui texto e tamanho mínimo de toque. O título e o painel se adaptam ao formato vertical sem modificar o menu principal.

## Preservação

Nenhuma imagem foi editada ou substituída. O arquivo incorreto permanece apenas no histórico/arquivos existentes; não é referenciado pelo jogo nem carregado na navegação. Não foi reutilizado para criar o fundo corrigido.

SHA-256 preservados:

- menu.png: 7db0e6759c011dfb91b95ab3a19aebaeaaadb01f181dc5978f8a3a3b90abd765
- mode.png: 5e91f773b503b64e782d33fcb73b64e529a3c2a46e36fdbd8e10c7e0dec3bc56

As únicas alterações de execução estão em index.html e no trecho de seleção de modos de css/styles.css. app.js, engine, controlador, distribuição, jogadas, Cuiudo, Nova mão, configurações, cenário, retratos, cartas e verso não foram alterados.

## Validação

26 testes unitários do catálogo, integridade das faces e jogabilidade aprovados.

Integração real em Chromium/Playwright, nas resoluções 1600 × 736, 390 × 844, 320 × 640, 844 × 390, 568 × 320 e 1280 × 720:

- Abertura e menu principal comparados por captura com a versão ade35d9, sem diferenças em desktop e celular.
- INICIAR abre a seleção correta; os textos dos botões são exigidos pelo teste, com fundo visível e altura mínima de 44 px.
- elementFromPoint confirma que o centro de cada botão coincide com sua área clicável.
- Nenhuma requisição a bg_menu_partidas.png durante todo o fluxo.
- Voltar retorna ao menu principal; 1v1 mantém a mensagem de desenvolvimento; 1vMáquina distribui a mão contra Cuiudo.
- Três jogadas humanas e três respostas automáticas, seis cartas visíveis, Nova mão e redistribuição.
- Saída, retorno à partida, cancelamento de temporizadores e configurações continuam funcionando.
- Mouse/teclado no desktop e toque em emulação móvel; sem exceções JavaScript ou falhas HTTP locais.
- Mesa comparada com o estado anterior, ocultando apenas as camadas dinâmicas da partida.
- git diff --check aprovado.

A fonte externa é bloqueada igualmente nas duas versões de teste para evitar dependência de rede. Os testes móveis são emulados, não realizados em aparelhos físicos.

O teste foi atualizado em tests/cards-browser.cjs. Capturas estão em docs/capturas/correcao-menu-{desktop,celular}.png, correcao-modos-{desktop,celular}.png e correcao-mesa-{desktop,celular}.png.

Com o projeto servido por HTTP, executar:

```sh
node --test tests/deck.test.mjs tests/game.test.mjs
BASE_URL=http://127.0.0.1:8000 node tests/cards-browser.cjs
```

BASELINE_URL, opcional, deve apontar para um checkout anterior servido separadamente para executar as comparações visuais. Playwright e Chromium são necessários apenas para os testes.
