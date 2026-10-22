# Cartas jogadas maiores — Sprint 3, Etapa 4

Alteração de apresentação em `css/game.css`, sem mudanças no HTML, JavaScript ou imagens. As cartas centrais passam de 3,1 × 4 cqw para 5,27 × 6,8 cqw no desktop e de 10 × 14 cqw para 17 × 23,8 cqw em celulares: aproximadamente 70% a mais em largura e altura. A área foi reposicionada para acomodar duas fileiras de três sem cobrir mãos, retratos, monte ou controles.

Em retrato largo (como 700 × 1024), um limite vertical reduz o aumento para respeitar o espaço disponível entre os elementos preservados. A arte continua com o mesmo enquadramento SVG, `preserveAspectRatio` e `image-rendering: pixelated`, sem modificar, cortar ou distorcer os PNGs oficiais.

## Capturas comparáveis

Mesma resolução, mesma sequência aleatória e mesmas seis cartas:

| Tela | Antes | Depois |
| --- | --- | --- |
| Desktop, 1600 × 736 | [Antes](capturas/cartas-maiores/desktop-antes-6.png) | [Depois](capturas/cartas-maiores/desktop-depois-6.png) |
| Celular, viewport 390 × 844, captura completa | [Antes](capturas/cartas-maiores/celular-antes-6.png) | [Depois](capturas/cartas-maiores/celular-depois-6.png) |

Também foram registradas comparações com [uma carta no desktop](capturas/cartas-maiores/desktop-depois-1.png), [três no desktop](capturas/cartas-maiores/desktop-depois-3.png), [uma no celular](capturas/cartas-maiores/celular-depois-1.png) e [três no celular](capturas/cartas-maiores/celular-depois-3.png). As versões anteriores estão na mesma pasta, com `antes` no nome.

## Verificação

- Teste Chromium/Playwright com 1, 3 e 6 cartas em 1600 × 736, 1280 × 720, 390 × 844, 320 × 640, 844 × 390, 568 × 320 e 700 × 1024.
- Comparação automática das dimensões e posições das mãos, retratos, monte e controles antes/depois; permanecem iguais.
- Verificação geométrica das seis posições: sem interseção entre cartas, sem cobrir elementos protegidos e com os quatro cantos dentro da elipse do feltro.
- Três jogadas, respostas automáticas, Nova mão e retorno ao menu em cada resolução; sem exceções JavaScript.
- Suíte funcional existente: navegação, configurações, clique/toque/teclado, bloqueio de turnos, distribuição e nova mão.
- 26 testes unitários passaram, incluindo integridade SHA-256 das 40 cartas oficiais.

Para repetir a comparação, sirva o commit anterior `bb19c75` na porta 8010 e esta versão na 8011. Com Playwright e Chromium disponíveis:

```sh
node tests/played-cards-browser.cjs
BASE_URL=http://127.0.0.1:8011 BASELINE_URL=http://127.0.0.1:8010 node tests/cards-browser.cjs
node --test tests/deck.test.mjs tests/game.test.mjs
```

As URLs são usadas pelo teste local; não representam uma prévia pública.
