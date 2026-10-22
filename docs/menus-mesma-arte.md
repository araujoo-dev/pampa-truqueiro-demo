# Menus com a mesma arte original

## Composição

Menu principal e seleção de modos usam exatamente o mesmo arquivo assets/backgrounds/menu.png, sem edição. A imagem possui os textos INICIAR e CONFIGURAÇÕES desenhados diretamente no PNG. Não há fonte editável ou arquivo em camadas fornecido no repositório.

Na seleção, somente duas pequenas camadas de rótulo são acrescentadas:

- assets/ui/label-1v1.png: região de 244 × 64, posição original (680, 324).
- assets/ui/label-1v-maquina.png: região de 320 × 68, posição original (682, 462).

Esses recortes foram preparados por edição localizada com a imagem original como referência. Incluem a madeira recomposta sob o texto antigo e os novos rótulos rasterizados no estilo pixel art da referência. O centro dos recortes é opaco e cobre completamente as palavras antigas; não é texto transparente sobreposto às letras anteriores. A borda tem uma transição de composição de seis pixels na madeira.

Somente os recortes de texto da edição foram exportados para o projeto: nenhum cenário editado ou recriado foi usado. As duas telas compartilham o PNG original, mantendo personagens, roupas, iluminação, placa, dois botões, bordas, parafusos, ornamentos e engrenagem.

Uma camada SVG com viewBox 0 0 1600 874 coloca os dois recortes nas coordenadas da imagem original. A camada acompanha a mesma escala do fundo e não recebe cliques. Os botões HTML mantêm os IDs usados pela navegação, rótulos acessíveis e o mesmo estilo hotspot do menu principal. Não há título MODOS DE JOGO, painel alternativo ou reenquadramento para celular.

Os seletores de INICIAR/1v1 compartilham uma única definição de tamanho e posição. O mesmo vale para CONFIGURAÇÕES/1vMáquina. As dimensões do frame e sua proporção 1600/874 também são iguais. Isso inclui os mesmos tamanhos físicos no celular, sem ampliar somente os botões da seleção e alterar a composição aprovada.

Um controle discreto Voltar é a única adição além dos rótulos. A imagem com nomes e a antiga mode.png não são solicitadas durante a navegação.

## Preservação

SHA-256 de menu.png preservado:

7db0e6759c011dfb91b95ab3a19aebaeaaadb01f181dc5978f8a3a3b90abd765

Nenhum código de partida, carta, verso, configuração, retrato ou cenário da mesa foi alterado. O menu principal usa os mesmos elementos e regras visuais anteriores.

Para outros rótulos no futuro, basta preparar novos recortes dessas regiões; não é necessário alterar ou gerar novamente cenário e botões.

## Verificação

- 26 testes unitários de catálogo, distribuição, jogadas e temporizadores aprovados.
- Integração real em Chromium/Playwright nas resoluções 1600 × 736, 390 × 844, 320 × 640, 844 × 390, 568 × 320 e 1280 × 720.
- Comparação entre as duas telas na mesma resolução: medidas do frame e dos dois botões idênticas, inclusive posições.
- Comparação pixel a pixel, ocultando somente Voltar: zero diferenças fora das duas regiões dos rótulos. A máscara admite um pixel de borda de rasterização ao escalar cada região. As duas regiões precisam efetivamente mudar.
- O menu principal e a abertura também são comparados com o checkout anterior fbcaef4 para assegurar sua preservação.
- Botões acessíveis 1v1 e 1vMáquina, área clicável correspondente ao centro do botão, retorno ao menu, mensagem do modo local e entrada na mesa.
- Três jogadas contra Cuiudo, resposta única por turno, seis cartas, Nova mão, cancelamento de timers ao sair, retorno e configurações.
- Nenhuma requisição às imagens mode.png ou bg_menu_partidas.png; nenhuma falha HTTP local ou exceção JavaScript.
- Mesa comparada com a versão anterior, ocultando somente as camadas dinâmicas da mão.

As comparações usam o mesmo estado sem hover nas duas telas. Google Fonts é bloqueado igualmente nos testes para evitar dependência externa; os rótulos do menu são rasterizados e não dependem dessa fonte. O celular é emulado, não um aparelho físico.

As capturas finais de menu e seleção em desktop têm 1600 × 900; em celular, 390 × 844. Cada par usa exatamente a mesma resolução. A mesa ao final de uma mão também foi capturada.

## Executar os testes

```sh
node --test tests/deck.test.mjs tests/game.test.mjs
BASE_URL=http://127.0.0.1:8000 node tests/cards-browser.cjs
```

A aplicação precisa estar servida por HTTP. Playwright e Chromium são necessários apenas para os testes. BASELINE_URL permite apontar para um checkout anterior servido separadamente. O README descreve o uso de Live Server ou do servidor Python.
