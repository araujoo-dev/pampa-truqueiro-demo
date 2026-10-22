import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck, shuffleDeck, randomIndex } from '../js/deck.js';
import { createGameEngine, GAME_PHASE } from '../js/game-engine.js';
import { createGameController } from '../js/game-controller.js';

function seeded(seed = 123) { return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32); }
const ids = cards => cards.map(c => c.id);
function allCards(s) { return [...s.playerHand, ...s.opponentHand, ...s.remaining, ...s.rounds.flatMap(r => [r.player, r.opponent].filter(Boolean))]; }
function assertIntegrity(s) {
  assert.equal(allCards(s).length, 40);
  assert.equal(new Set(ids(allCards(s))).size, 40);
  assert.deepEqual(ids(allCards(s)).sort(), ids(createDeck()).sort());
}
function finish(engine) {
  while (engine.getState().phase !== GAME_PHASE.FINISHED) {
    const s = engine.getState();
    assert(engine.playPlayer(s.playerHand[0].id));
    assert(engine.playOpponent(s.handId));
  }
}
function harness() {
  let id = 0;
  const callbacks = new Map(), cancelled = new Set(), changes = [];
  const engine = createGameEngine({ random: seeded() });
  const controller = createGameController({ engine, onChange: (state, reason) => changes.push({ state, reason }), schedule: (fn, delay) => { callbacks.set(++id, { fn, delay }); return id; }, cancel: id => cancelled.add(id) });
  return { engine, controller, callbacks, cancelled, changes, fire: id => callbacks.get(id).fn() };
}

test('Fisher-Yates faz n-1 sorteios e preserva catálogo e entrada', () => {
  const input = createDeck(), before = ids(input); let calls = 0;
  const result = shuffleDeck(input, () => { calls++; return 0; });
  assert.equal(calls, 39);
  assert.deepEqual(ids(result), [...before.slice(1), before[0]]);
  assert.deepEqual(ids(input), before);
  assert.notEqual(result, input);
});
test('aleatoriedade controlada reproduz embaralhamento, sem duplicação', () => {
  const a = shuffleDeck(createDeck(), seeded()), b = shuffleDeck(createDeck(), seeded());
  assert.deepEqual(a, b);
  assert.equal(new Set(ids(a)).size, 40);
  assert.deepEqual(ids(a).sort(), ids(createDeck()).sort());
});
test('tamanho vazio e aleatoriedade fora do intervalo são rejeitados', () => {
  assert.throws(() => randomIndex(0), RangeError);
  for (const value of [-1, 1, NaN, Infinity]) assert.throws(() => shuffleDeck(createDeck(), () => value), RangeError);
  assert.deepEqual(shuffleDeck([], () => { throw Error('não deve sortear'); }), []);
});
test('mão começa com 3+3 cartas exclusivas e 34 reservadas', () => {
  const engine = createGameEngine({ random: seeded() });
  assert.equal(engine.getState().phase, GAME_PHASE.INACTIVE);
  const s = engine.startHand();
  assert.equal(s.playerHand.length, 3); assert.equal(s.opponentHand.length, 3); assert.equal(s.remaining.length, 34);
  assert(s.rounds.every(r => !r.player && !r.opponent));
  assert.equal(s.phase, GAME_PHASE.PLAYER); assertIntegrity(s);
});
test('carta válida sai da mão e ocupa o primeiro par, sem perder identidade', () => {
  const e = createGameEngine({ random: seeded() }), before = e.startHand();
  const card = before.playerHand[1]; assert(e.playPlayer(card.id));
  const s = e.getState(); assert.equal(s.playerHand.length, 2); assert(!s.playerHand.includes(card));
  assert.equal(s.rounds[0].player, card); assert.equal(s.phase, GAME_PHASE.OPPONENT); assertIntegrity(s);
});
test('carta inexistente, reservada ou do adversário não pode ser jogada', () => {
  const e = createGameEngine({ random: seeded() }), s = e.startHand();
  for (const id of ['inexistente', s.remaining[0].id, s.opponentHand[0].id]) assert.equal(e.playPlayer(id), false);
  assert.deepEqual(e.getState(), s);
});
test('cliques repetidos e segunda carta no turno do Cuiudo são rejeitados', () => {
  const e = createGameEngine({ random: seeded() }), s = e.startHand();
  assert(e.playPlayer(s.playerHand[0].id)); const waiting = e.getState();
  assert.equal(e.playPlayer(s.playerHand[0].id), false); assert.equal(e.playPlayer(s.playerHand[1].id), false);
  assert.deepEqual(e.getState(), waiting);
});
test('Cuiudo usa sua própria carta e responde uma única vez', () => {
  const e = createGameEngine({ random: seeded() }), s = e.startHand();
  assert.equal(e.playOpponent(s.handId), false); e.playPlayer(s.playerHand[0].id);
  assert(e.playOpponent(s.handId)); const after = e.getState();
  assert(s.opponentHand.includes(after.rounds[0].opponent)); assert.equal(after.opponentHand.length, 2);
  assert.equal(after.phase, GAME_PHASE.PLAYER); assert.equal(e.playOpponent(s.handId), false);
  assert.deepEqual(e.getState(), after); assertIntegrity(after);
});
test('carta já usada não é aceita no próximo turno', () => {
  const e = createGameEngine({ random: seeded() }), s = e.startHand(); const id = s.playerHand[0].id;
  e.playPlayer(id); e.playOpponent(s.handId); const before = e.getState();
  assert.equal(e.playPlayer(id), false); assert.deepEqual(e.getState(), before);
});
test('três pares encerram a mão, mantêm seis cartas e bloqueiam novas jogadas', () => {
  const e = createGameEngine({ random: seeded() }); e.startHand(); finish(e); const s = e.getState();
  assert.equal(s.playerHand.length, 0); assert.equal(s.opponentHand.length, 0);
  assert(s.rounds.every(r => r.player && r.opponent)); assertIntegrity(s);
  assert.equal(e.playPlayer(s.rounds[0].player.id), false); assert.equal(e.playOpponent(s.handId), false);
  assert.deepEqual(e.getState(), s);
});
test('snapshots e registros não permitem alterar o estado por fora', () => {
  const e = createGameEngine({ random: seeded() }); const s = e.startHand();
  assert.throws(() => s.playerHand.pop(), TypeError); assert.throws(() => { s.rounds[0].player = s.playerHand[0]; }, TypeError);
  e.playPlayer(s.playerHand[0].id); assert.equal(s.playerHand.length, 3); assert.equal(s.rounds[0].player, null);
});
test('nova mão limpa jogadas e invalida resposta da mão anterior', () => {
  const e = createGameEngine({ random: seeded() }), first = e.startHand(); e.playPlayer(first.playerHand[0].id);
  const next = e.startHand(); e.playPlayer(next.playerHand[0].id); const waiting = e.getState();
  assert.equal(e.playOpponent(first.handId), false); assert.deepEqual(e.getState(), waiting);
  assert(e.playOpponent(next.handId)); assertIntegrity(e.getState());
});
test('abandono elimina a mão e rejeita callbacks antigos', () => {
  const e = createGameEngine({ random: seeded() }), s = e.startHand(); e.playPlayer(s.playerHand[0].id); e.abandon();
  assert.equal(e.playOpponent(s.handId), false); assert.equal(e.getState().phase, GAME_PHASE.INACTIVE);
  assert.equal(allCards(e.getState()).length, 0);
});
test('100 mãos consecutivas mantêm as 40 cartas sem duplicar', () => {
  const e = createGameEngine({ random: seeded() });
  for (let i = 0; i < 100; i++) { const s = e.startHand(); assert.equal(s.phase, GAME_PHASE.PLAYER); assertIntegrity(s); finish(e); assertIntegrity(e.getState()); }
});
test('controlador bloqueia sincronicamente e agenda somente uma resposta de 850ms', () => {
  const h = harness(); h.controller.start(); const [a, b] = h.controller.getState().playerHand;
  assert(h.controller.play(a.id)); assert.equal(h.changes.at(-1).state.phase, GAME_PHASE.OPPONENT);
  assert.equal(h.controller.play(b.id), false); assert.equal(h.callbacks.size, 1); assert.equal(h.callbacks.get(1).delay, 850);
  h.fire(1); assert.equal(h.controller.getState().phase, GAME_PHASE.PLAYER); const s = h.controller.getState();
  h.fire(1); assert.deepEqual(h.controller.getState(), s);
});
test('saída cancela timer; mesmo um callback cancelado forçado não responde após retornar', () => {
  const h = harness(); h.controller.start(); h.controller.play(h.controller.getState().playerHand[0].id);
  h.controller.stop(); assert(h.cancelled.has(1)); h.controller.start();
  h.controller.play(h.controller.getState().playerHand[0].id); const s = h.controller.getState();
  h.fire(1); assert.deepEqual(h.controller.getState(), s); h.fire(2); assert.equal(h.controller.getState().phase, GAME_PHASE.PLAYER);
});
test('reinício programático com timer pendente cancela e invalida a resposta', () => {
  const h = harness(); h.controller.start(); h.controller.play(h.controller.getState().playerHand[0].id);
  h.controller.start(); const s = h.controller.getState(); assert(h.cancelled.has(1)); h.fire(1); assert.deepEqual(h.controller.getState(), s);
});
test('Nova mão só é aceita no encerramento e limpa o estado anterior', () => {
  const h = harness(); h.controller.start(); assert.equal(h.controller.newHand(), false);
  for (let i = 1; i <= 3; i++) { h.controller.play(h.controller.getState().playerHand[0].id); assert.equal(h.controller.newHand(), false); h.fire(i); }
  assert.equal(h.controller.getState().phase, GAME_PHASE.FINISHED); assert(h.controller.newHand());
  const s = h.controller.getState(); assert(s.rounds.every(r => !r.player && !r.opponent)); assert.equal(s.phase, GAME_PHASE.PLAYER); assertIntegrity(s);
});
test('controlador completa 20 mãos com Nova mão, sem respostas excedentes', () => {
  const h = harness(); h.controller.start();
  for (let hand = 0; hand < 20; hand++) {
    for (let turn = 0; turn < 3; turn++) {
      assert(h.controller.play(h.controller.getState().playerHand[0].id));
      h.fire(hand * 3 + turn + 1);
    }
    const s = h.controller.getState(); assert.equal(s.phase, GAME_PHASE.FINISHED); assertIntegrity(s);
    if (hand < 19) assert(h.controller.newHand());
  }
  assert.equal(h.callbacks.size, 60);
  assert.equal(h.changes.filter(c => c.reason === 'opponent').length, 60);
});
