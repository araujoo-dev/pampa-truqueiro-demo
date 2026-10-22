# Validação da revisão visual — Etapa 2

Testes executados com Chromium e Playwright no ambiente de desenvolvimento:

- Desktop 1600 × 736, celular 390 × 844, celular pequeno 320 × 640 paisagem 844 × 390, paisagem pequena 568 × 320 e notebook 1280 × 720.
- Navegação da abertura ao menu e modos; modo local mantém a mensagem de construção; modo máquina abre a mesa.
- Configurações acessíveis pelo menu e pela mesa; alteração de volume, Fechar e Salvar preservados.
- Retorno da mesa ao menu principal e retorno do menu de modos.
- Quatro ações futuras e controle de som com atributo disabled; cartas estáticas, sem confirmação de jogada.
- Seis espaços centrais para futuras cartas.
- Verificação geométrica de ausência de sobreposição entre blocos de interface: placar, título, retratos, mãos, ações, botões laterais, monte e área central. A sobreposição intencional entre cartas do mesmo leque é parte da apresentação.
- Ausência de transbordamento horizontal nas dimensões testadas.
- Carregamento de todos os recursos locais sem HTTP 4xx/5xx e sem exceções JavaScript.
- Capturas de abertura, menu principal e modos comparadas à main de origem (025e5e9), sem diferenças em desktop e celular. Arquivo css/styles.css e imagens dos menus preservados.
- node --check js/app.js e git diff --check.

A fonte externa do Google Fonts foi bloqueada no navegador de teste para evitar dependência de rede; a referência e a revisão receberam a mesma condição. A mesa usa fonte serifada do sistema, conforme a referência visual. Testes móveis realizados em emulação, não em aparelhos físicos.

Nenhum teste de regras ou pontuação se aplica: essas funcionalidades não foram implementadas.
