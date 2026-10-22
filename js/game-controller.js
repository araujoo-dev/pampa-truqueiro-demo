import { GAME_PHASE } from './game-engine.js';

// Coordena o atraso visual sem colocar temporizadores na lógica da mão.
export function createGameController({ engine, onChange, delay = 850, schedule = setTimeout, cancel = clearTimeout }) {
  let timer = null;
  let revision = 0;
  const emit = reason => onChange(engine.getState(), reason);

  function cancelPending() {
    revision++;
    if (timer !== null) cancel(timer);
    timer = null;
  }

  function start() {
    cancelPending();
    engine.startHand();
    emit('start');
  }

  function play(cardId) {
    if (!engine.playPlayer(cardId)) return false;
    const handId = engine.getState().handId;
    const turn = ++revision;
    emit('player'); // Bloqueia os botões sincronicamente antes de agendar a resposta.
    timer = schedule(() => {
      if (turn !== revision) return;
      timer = null;
      if (engine.playOpponent(handId)) emit('opponent');
    }, delay);
    return true;
  }

  function newHand() {
    if (engine.getState().phase !== GAME_PHASE.FINISHED) return false;
    start();
    return true;
  }

  function stop() {
    cancelPending();
    engine.abandon();
    emit('stop');
  }

  return Object.freeze({ start, play, newHand, stop, getState: engine.getState });
}
