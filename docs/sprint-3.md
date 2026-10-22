# Sprint 3 — plano incremental

Cada etapa depende de validação e autorização antes de avançar. As Etapas 1, 2 e 3 foram aprovadas, inclusive as cartas e o verso gaúcho. A Etapa 4 de entrega implementa a primeira mão jogável contra o Cuiudo, reunindo os itens 4 a 7 do plano interno abaixo. Funcionalidades adicionais dependem de nova autorização.

1. **Organizar a base:** separar HTML, CSS e JavaScript; extrair as imagens incorporadas; preparar pastas sem mudar a aparência ou o comportamento.
2. **Criar a mesa:** feltro verde, madeira, jogador abaixo, computador acima e espaços para cartas, placar e ações futuras.
3. **Modelar o baralho:** 40 cartas espanholas com identificadores únicos, catálogo visual independente e integração das 40 faces oficiais.
4. **Preparar a mão:** embaralhamento e distribuição de três cartas distintas por participante.
5. **Jogada humana:** um clique ou toque em uma carta disponível joga imediatamente, sem botão Jogar carta e sem confirmação. A carta sai da mão e aparece no centro. Validar turno e disponibilidade antes de alterar o estado; bloquear imediatamente os novos cliques enquanto o computador responde; impedir reutilização.
6. **Computador:** responder automaticamente com uma carta aleatória da própria mão, uma única vez por turno. O fluxo integrado das etapas 5 e 6 deve ser validado antes de prosseguir.
7. **Encerrar e reiniciar:** após três jogadas por participante, permitir nova mão, limpando seleção, cartas e ações pendentes.
8. **Validar o conjunto:** integridade do baralho, turnos, repetição de mãos, navegação, mouse, toque e teclado.

Na etapa de jogabilidade, o teclado também deve ativar os mesmos controles de carta. Estado e regras ficam separados da apresentação e dos caminhos das imagens.

Não fazem parte desta Sprint: apuração de vencedores, pontuação até 24, Truco, Retruco, Vale Quatro, Envido, Flor ou estratégia avançada do computador.

Comportamento implementado na Etapa 4: humano inicia a mão; três pares de cartas ficam visíveis no centro; nova mão somente após as seis jogadas. As 40 faces em PNG foram recebidas e preservadas; Bastos mapeia para paus-*.
