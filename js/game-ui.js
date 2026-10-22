import { CARD_ASSETS, CARD_BACK } from './card-assets.js';
import { createGameEngine, GAME_PHASE } from './game-engine.js';
import { createGameController } from './game-controller.js';
import { GAME_CONFIG } from './game-config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SUIT_LABELS = { espadas: 'Espadas', bastos: 'Bastos', copas: 'Copas', ouros: 'Ouros' };

// O viewBox remove somente as margens de exportação e resíduos isolados fora da
// carta. Todos os desenhos e detalhes da carta permanecem no enquadramento.
// preserveAspectRatio garante escala uniforme, sem alterar os PNGs originais.
function createCardArt(asset, label) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add('card-art');
  svg.setAttribute('viewBox', asset.frame.join(' '));
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label);
  const image = document.createElementNS(SVG_NS, 'image');
  image.setAttribute('href', asset.src);
  image.setAttribute('width', asset.width);
  image.setAttribute('height', asset.height);
  svg.append(image);
  return svg;
}

const gameScreen = document.getElementById('gameScreen');
const hand = gameScreen.querySelector('.human-hand');
const opponentHand = gameScreen.querySelector('.opponent-hand');
const pairs = [...gameScreen.querySelectorAll('.played-pair')];
const status = document.getElementById('gameStatus');
const newHandButton = document.getElementById('btnNewHand');
let restoreHandFocus = false;

function describe(card) {
  return `${card.valor} de ${SUIT_LABELS[card.naipe]}`;
}

function face(card, interactive, enabled = false) {
  const element = document.createElement(interactive ? 'button' : 'div');
  element.className = 'demo-card card-face official-card';
  const art = createCardArt(CARD_ASSETS[card.id], describe(card));
  if (interactive) {
    element.type = 'button';
    element.classList.add('playable-card');
    element.dataset.cardId = card.id;
    element.disabled = !enabled;
    element.setAttribute('aria-label', `Jogar ${describe(card)}`);
    art.setAttribute('aria-hidden', 'true');
  }
  element.append(art);
  return element;
}

function back() {
  const element = document.createElement('div');
  element.className = 'demo-card card-back official-card';
  element.append(createCardArt(CARD_BACK, `Carta de ${GAME_CONFIG.opponentName} virada para baixo`));
  return element;
}

function render(state, reason) {
  if (reason === 'player') restoreHandFocus = hand.contains(document.activeElement);
  const canPlay = state.phase === GAME_PHASE.PLAYER;
  hand.replaceChildren(...state.playerHand.map(card => face(card, true, canPlay)));
  hand.setAttribute('aria-busy', String(state.phase === GAME_PHASE.OPPONENT));
  // Nenhum identificador ou caminho de face oculta vai para o DOM do adversário.
  opponentHand.replaceChildren(...state.opponentHand.map(() => back()));
  state.rounds.forEach((round, i) => {
    for (const [j, owner] of ['opponent', 'player'].entries()) {
      const slot = pairs[i].children[j];
      const card = round[owner];
      slot.classList.toggle('has-card', Boolean(card));
      slot.setAttribute('aria-label', `${owner === 'player' ? 'Você' : GAME_CONFIG.opponentName}: ${card ? describe(card) : 'espaço vazio'}`);
      if ((slot.dataset.cardId || null) !== (card?.id || null)) {
        slot.replaceChildren(...(card ? [createCardArt(CARD_ASSETS[card.id], describe(card))] : []));
        if (card) slot.dataset.cardId = card.id;
        else delete slot.dataset.cardId;
      }
    }
  });
  if (!state.rounds.length) pairs.forEach(pair => [...pair.children].forEach(slot => {
    slot.replaceChildren(); slot.classList.remove('has-card'); slot.removeAttribute('aria-label'); delete slot.dataset.cardId;
  }));
  const finished = state.phase === GAME_PHASE.FINISHED;
  newHandButton.hidden = !finished;
  status.textContent = finished ? 'Mão encerrada — seis cartas na mesa.'
    : canPlay ? 'Sua vez — escolha uma carta.'
    : state.phase === GAME_PHASE.OPPONENT ? `${GAME_CONFIG.opponentName} está escolhendo uma carta…` : '';

  const focusIsFree = document.activeElement === document.body || hand.contains(document.activeElement) || document.activeElement === newHandButton;
  const shouldFocus = reason === 'start' || (reason === 'opponent' && restoreHandFocus);
  if (shouldFocus && focusIsFree && gameScreen.classList.contains('active') && !document.getElementById('modalVeil').classList.contains('active')) {
    (finished ? newHandButton : hand.querySelector('button:not(:disabled)'))?.focus({ preventScroll: true });
  }
  if (reason === 'opponent' || reason === 'stop') restoreHandFocus = false;
}

const controller = createGameController({
  engine: createGameEngine(),
  delay: GAME_CONFIG.opponentDelayMs,
  onChange: render,
});

hand.addEventListener('click', event => {
  const button = event.target.closest('button[data-card-id]');
  if (button && hand.contains(button) && !button.disabled) controller.play(button.dataset.cardId);
});
newHandButton.addEventListener('click', () => controller.newHand());

const opponentPortrait = gameScreen.querySelector('.portrait.opponent');
opponentPortrait.querySelector('[data-opponent-name]').textContent = GAME_CONFIG.opponentName;
opponentPortrait.querySelector('img').alt = `Retrato de ${GAME_CONFIG.opponentName}`;
const deckTop = gameScreen.querySelector('.deck-stack [data-card-back]');
deckTop.classList.add('official-card');
deckTop.removeAttribute('aria-label');
deckTop.replaceChildren(createCardArt(CARD_BACK, 'Monte de cartas'));

export function startGame() { controller.start(); }
export function stopGame() { controller.stop(); }
