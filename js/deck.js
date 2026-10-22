import { CARD_ASSETS, CARD_VALUES, SUIT_FILES } from './card-assets.js';

export { CARD_VALUES };
export const CARD_SUITS = Object.freeze(Object.keys(SUIT_FILES));

// Valor é o número impresso, não a força da carta no Truco.
export const CARD_CATALOG = Object.freeze(CARD_SUITS.flatMap(naipe =>
  CARD_VALUES.map(valor => {
    const id = `${naipe}-${valor}`;
    return Object.freeze({ id, naipe, valor, imagem: CARD_ASSETS[id].src });
  }),
));

// Coleção independente, sempre na mesma ordem; sem embaralhar ou distribuir.
export function createDeck() {
  return [...CARD_CATALOG];
}

export function getCard(id) {
  return CARD_CATALOG.find(card => card.id === id);
}

export function randomIndex(length, random = Math.random) {
  if (!Number.isInteger(length) || length < 1) throw new RangeError('Coleção vazia ou tamanho inválido.');
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('A aleatoriedade deve estar entre 0 (inclusivo) e 1 (exclusivo).');
  return Math.floor(value * length);
}

// Fisher-Yates em uma cópia. A fonte injetável permite testes determinísticos.
export function shuffleDeck(cards = createDeck(), random = Math.random) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
