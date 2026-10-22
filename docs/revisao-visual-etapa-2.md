# Revisão visual da Etapa 2

## Comparação com a referência

| Elemento | Resultado |
| --- | --- |
| Salão, tijolos, iluminação quente, balcão e personagens | Nova arte de cenário, separada dos controles; não é uma cópia exata do salão da referência |
| Mesa oval verde-escura com madeira grossa | Elementos HTML/CSS; ocupa quase toda a composição horizontal |
| Placar no alto à esquerda e título no centro | Posicionamento relativo seguindo a referência; travessões indicam ausência de pontuação |
| Adversário à direita e jogador abaixo à esquerda | Retratos originais provisórios em PNG e nomes em HTML, substituíveis independentemente |
| Três versos, monte e três cartas abertas | Camadas HTML independentes; ilustrações de exemplo em SVG, sem baralho ou interação |
| Centro da mesa | Seis espaços discretos, preservados para futuras cartas jogadas |
| Envido, Real Envido, Falta Envido e Flor | Faixa inferior; todos com atributo disabled e aviso de indisponibilidade |
| Configurações e som | Lateral direita; configurações abre o modal existente; som desabilitado |
| Celular vertical | Composição adaptada, mesa mais alta e ações em duas linhas, sem preservar literalmente a proporção horizontal |

## Diferenças restantes e recursos finais

A composição segue a referência, mas não é uma reprodução pixel a pixel. O cenário e os retratos foram gerados como artes novas provisórias. Molduras, ornamentos, borda de madeira e símbolos são aproximações feitas em CSS/SVG; as três cartas abertas têm desenhos simplificados. A interface não exibe o diálogo de Envido nem troféus da referência, pois não há uma ação de jogo ou conquista em andamento.

Para o acabamento exato, a equipe pode fornecer: cenário sem a interface; molduras/ornamentos e texturas de feltro e madeira; emblema do projeto; ícones oficiais; retratos personalizados; verso e as 40 faces das cartas. Esses recursos não são necessários para executar a prévia atual. A imagem inteira da referência não foi usada como interface nem como fundo com áreas clicáveis.

## Recursos desta revisão

- `assets/backgrounds/saloon.png`: cenário gerado, sem mesa nem controles.
- `assets/characters/player.png` e `opponent.png`: retratos provisórios gerados, sem vínculo definitivo com os personagens do projeto.
- `assets/table/`: ilustrações demonstrativas e textura do feltro em SVG.
- `docs/capturas/`: capturas reais do navegador em desktop e celular.

Para substituir personagens, mantenha os caminhos acima ou atualize os atributos src das imagens e os textos figcaption em index.html. Nenhum nome está incorporado na arte.
