// Único ponto de associação entre identidade lógica, arquivo e enquadramento visual.
// Os PNGs oficiais permanecem intactos. Coordenadas em pixels do arquivo original.
export const CARD_VALUES = Object.freeze([1, 2, 3, 4, 5, 6, 7, 10, 11, 12]);
export const SUIT_FILES = Object.freeze({
  espadas: 'espadas',
  bastos: 'paus', // Nome lógico espanhol; nomenclatura da equipe preservada no disco.
  copas: 'copas',
  ouros: 'ouros',
});

function faceFrame(suit, value) {
  if (suit === 'espadas' && value === 1) return [440, 143, 671, 968];
  if (suit === 'ouros' && value === 1) return [330, 170, 610, 880];
  if (value === 10) return [320, 210, 620, 870];
  if (value === 11) return [330, 200, 610, 880];
  if (value === 12) return [330, 210, 610, 860];
  return [320, 250, 610, 880];
}

export const CARD_ASSETS = Object.freeze(Object.fromEntries(
  Object.entries(SUIT_FILES).flatMap(([suit, fileSuit]) => CARD_VALUES.map(value => {
    const size = suit === 'espadas' && value === 1 ? 1408 : 1280;
    return [`${suit}-${value}`, Object.freeze({
      src: `assets/cards/${fileSuit}-${value}.png`,
      width: size,
      height: size,
      frame: Object.freeze(faceFrame(suit, value)),
    })];
  })),
));

// Verso aprovado visualmente pela equipe ao concluir a Etapa 3.
export const CARD_BACK = Object.freeze({
  src: 'assets/cards/verso.png',
  width: 1280,
  height: 1280,
  frame: Object.freeze([360, 200, 560, 880]),
  status: 'approved',
});
