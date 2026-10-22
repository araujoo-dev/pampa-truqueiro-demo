import { shuffleDeck, createDeck, randomIndex } from './deck.js';

export const GAME_PHASE = Object.freeze({
  INACTIVE: 'inativa',
  PLAYER: 'aguardando_jogador',
  OPPONENT: 'aguardando_cuiudo',
  FINISHED: 'mao_encerrada',
});

// Estado privado, sem DOM, relógio ou determinação de vencedores.
export function createGameEngine({ random = Math.random } = {}) {
  let handId = 0;
  let phase = GAME_PHASE.INACTIVE;
  let playerHand = [], opponentHand = [], remaining = [], rounds = [];

  function getState() {
    return Object.freeze({
      handId, phase,
      playerHand: Object.freeze([...playerHand]),
      opponentHand: Object.freeze([...opponentHand]),
      remaining: Object.freeze([...remaining]),
      rounds: Object.freeze(rounds.map(round => Object.freeze({ ...round }))),
    });
  }

  function startHand() {
    const deck = shuffleDeck(createDeck(), random);
    handId++;
    playerHand = deck.slice(0, 3);
    opponentHand = deck.slice(3, 6);
    remaining = deck.slice(6);
    rounds = Array.from({ length: 3 }, () => ({ player: null, opponent: null }));
    phase = GAME_PHASE.PLAYER;
    return getState();
  }

  function playPlayer(cardId) {
    if (phase !== GAME_PHASE.PLAYER) return false;
    const index = playerHand.findIndex(card => card.id === cardId);
    if (index === -1) return false;
    const round = rounds.find(round => round.player === null);
    round.player = playerHand.splice(index, 1)[0];
    phase = GAME_PHASE.OPPONENT;
    return true;
  }

  // O identificador impede que callbacks de uma mão anterior afetem a atual.
  function playOpponent(expectedHandId) {
    if (expectedHandId !== handId || phase !== GAME_PHASE.OPPONENT) return false;
    const round = rounds.find(round => round.player && !round.opponent);
    const index = randomIndex(opponentHand.length, random);
    round.opponent = opponentHand.splice(index, 1)[0];
    phase = playerHand.length ? GAME_PHASE.PLAYER : GAME_PHASE.FINISHED;
    return true;
  }

  function abandon() {
    handId++;
    phase = GAME_PHASE.INACTIVE;
    playerHand = []; opponentHand = []; remaining = []; rounds = [];
  }

  return Object.freeze({ getState, startHand, playPlayer, playOpponent, abandon });
}
