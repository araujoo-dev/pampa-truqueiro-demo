import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CARD_CATALOG, CARD_SUITS, CARD_VALUES, createDeck, getCard } from '../js/deck.js';
import { CARD_ASSETS, CARD_BACK } from '../js/card-assets.js';

const root = new URL('../', import.meta.url);
const hashes = JSON.parse(readFileSync(new URL('fixtures/official-card-hashes.json', import.meta.url)));

test('40 identidades únicas e 40 caminhos distintos', () => {
  assert.equal(CARD_CATALOG.length, 40);
  assert.equal(new Set(CARD_CATALOG.map(c => c.id)).size, 40);
  assert.equal(new Set(CARD_CATALOG.map(c => c.imagem)).size, 40);
});
test('quatro naipes espanhóis, dez valores válidos por naipe', () => {
  assert.deepEqual(CARD_SUITS, ['espadas', 'bastos', 'copas', 'ouros']);
  assert.deepEqual(CARD_VALUES, [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]);
  for (const naipe of CARD_SUITS) {
    assert.deepEqual(CARD_CATALOG.filter(c => c.naipe === naipe).map(c => c.valor), CARD_VALUES);
  }
});
test('identificadores e arquivos correspondem; Bastos usa paus sem renomear', () => {
  for (const card of CARD_CATALOG) {
    assert.equal(card.id, `${card.naipe}-${card.valor}`);
    const fileSuit = card.naipe === 'bastos' ? 'paus' : card.naipe;
    assert.equal(card.imagem, `assets/cards/${fileSuit}-${card.valor}.png`);
    assert.equal(card.imagem, CARD_ASSETS[card.id].src);
  }
  assert.equal(getCard('paus-1'), undefined);
  assert.equal(getCard('espadas-8'), undefined);
  assert.equal(getCard('bastos-1').naipe, 'bastos');
});
test('pasta possui exatamente as 40 faces e o verso', () => {
  const actual = readdirSync(new URL('assets/cards/', root)).filter(n => n.endsWith('.png')).sort();
  assert.deepEqual(actual, [...Object.keys(hashes), 'verso.png'].sort());
});
test('40 PNGs oficiais idênticos aos arquivos recebidos, por SHA-256', () => {
  assert.equal(Object.keys(hashes).length, 40);
  for (const [name, expected] of Object.entries(hashes)) {
    const bytes = readFileSync(new URL(`assets/cards/${name}`, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, name);
  }
});
test('dimensões e enquadramentos respeitam os PNGs originais', () => {
  for (const asset of [...Object.values(CARD_ASSETS), CARD_BACK]) {
    const bytes = readFileSync(new URL(asset.src, root));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), asset.width);
    assert.equal(bytes.readUInt32BE(20), asset.height);
    const [x, y, w, h] = asset.frame;
    assert(x >= 0 && y >= 0 && w > 0 && h > 0);
    assert(x + w <= asset.width && y + h <= asset.height);
  }
  assert.equal(CARD_ASSETS['espadas-1'].width, 1408);
  assert.equal(CARD_BACK.width, 1280);
  assert.equal(CARD_BACK.height, 1280);
  assert.equal(CARD_BACK.status, 'approved');
});
test('catálogo imutável; coleções independentes e determinísticas', () => {
  const a = createDeck(), b = createDeck();
  assert.notEqual(a, b);
  assert.deepEqual(a, b);
  a.pop();
  assert.equal(b.length, 40);
  assert.equal(CARD_CATALOG.length, 40);
  assert(Object.isFrozen(CARD_CATALOG));
  for (const card of CARD_CATALOG) assert(Object.isFrozen(card));
});
