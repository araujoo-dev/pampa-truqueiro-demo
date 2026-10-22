// Requer Playwright e Chromium; a aplicação continua sem dependências de build.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:8004';
const baseline = process.env.BASELINE_URL;
const captures = process.env.CAPTURE_DIR || '/tmp/pampa-etapa4-capturas';

async function menuGeometry(page, frame, buttons) {
  return page.evaluate(({ frame, buttons }) => {
    const rect = selector => { const b = document.querySelector(selector).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
    return { frame: rect(frame), buttons: buttons.map(rect), background: getComputedStyle(document.querySelector(frame)).backgroundImage };
  }, { frame, buttons });
}

async function labelDifference(page, before, after, frame) {
  return page.evaluate(async ({ before, after, frame }) => {
    const decode = async value => { const i = new Image(); i.src = `data:image/png;base64,${value}`; await i.decode(); return i; };
    const a = await decode(before), b = await decode(after);
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const ctx = c.getContext('2d'); ctx.drawImage(a, 0, 0); const d1 = ctx.getImageData(0, 0, c.width, c.height).data;
    ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(b, 0, 0); const d2 = ctx.getImageData(0, 0, c.width, c.height).data;
    // Somente os dois rótulos, com 1px para a borda de rasterização escalada.
    const boxes = [[680, 324, 244, 64], [682, 462, 320, 68]].map(([x, y, w, h]) => ({
      l: Math.floor(frame.x + x * frame.width / 1600) - 1,
      t: Math.floor(frame.y + y * frame.height / 874) - 1,
      r: Math.ceil(frame.x + (x + w) * frame.width / 1600) + 1,
      b: Math.ceil(frame.y + (y + h) * frame.height / 874) + 1,
    }));
    const inside = [0, 0]; let outside = 0;
    for (let i = 0; i < d1.length; i += 4) {
      if (d1[i] === d2[i] && d1[i+1] === d2[i+1] && d1[i+2] === d2[i+2] && d1[i+3] === d2[i+3]) continue;
      const x = (i / 4) % c.width, y = Math.floor(i / 4 / c.width);
      const box = boxes.findIndex(b => x >= b.l && x < b.r && y >= b.t && y < b.b);
      if (box === -1) outside++; else inside[box]++;
    }
    return { outside, inside };
  }, { before: before.toString('base64'), after: after.toString('base64'), frame });
}

(async () => {
  mkdirSync(captures, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-gpu'] });
  try {
    for (const [name, width, height, touch] of [
      ['desktop', 1600, 736, false], ['celular', 390, 844, true],
      ['pequeno', 320, 640, true], ['paisagem', 844, 390, true],
      ['paisagem-pequena', 568, 320, true], ['notebook', 1280, 720, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch, reducedMotion: name === 'pequeno' ? 'reduce' : 'no-preference' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      const p = await context.newPage(); const errors = [], bad = [], forbiddenArt = [];
      p.on('request', request => { if (/\/(bg_menu_partidas|mode)\.png(?:$|\?)/.test(request.url())) forbiddenArt.push(request.url()); });
      p.on('pageerror', error => errors.push(error.message));
      p.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) bad.push(r.url()); });
      const click = async (page, selector) => page.locator(selector)[touch ? 'tap' : 'click']();
      const played = () => p.locator('.card-slot.has-card').count();
      const waitPlayed = n => p.waitForFunction(n => document.querySelectorAll('.card-slot.has-card').length === n, n, { timeout: 4000 });
      await p.goto(base);
      await p.waitForFunction(() => document.querySelector('[data-opponent-name]').textContent === 'Cuiudo');
      let original, mainShot, mainGeometry;
      const captureMain = async () => {
        await p.mouse.move(0, 0);
        mainShot = await p.screenshot({ animations: 'disabled' });
        mainGeometry = await menuGeometry(p, '#menuFrame', ['#btnIniciar', '#btnConfig']);
        if (['desktop', 'celular'].includes(name)) require('node:fs').writeFileSync(`${captures}/menu-${name}.png`, mainShot);
      };
      if (baseline && ['desktop', 'celular'].includes(name)) {
        original = await context.newPage(); await original.goto(baseline);
        for (const stage of ['abertura', 'menu', 'modos']) {
          if (stage !== 'modos') {
            await p.mouse.move(0, 0); await original.mouse.move(0, 0);
            assert((await p.screenshot({ animations: 'disabled' })).equals(await original.screenshot({ animations: 'disabled' })), `${name}: ${stage} mudou`);
          }
          if (stage === 'menu') await captureMain();
          if (stage !== 'modos') for (const page of [p, original]) await click(page, stage === 'abertura' ? '#splashFrame' : '#btnIniciar');
        }
      } else { await click(p, '#splashFrame'); await captureMain(); await click(p, '#btnIniciar'); }
      assert.equal(await p.locator('#btn1v1').textContent(), '1v1');
      assert.equal(await p.locator('#btn1vUI').textContent(), '1vMáquina');
      assert.match(await p.locator('#modeFrame').evaluate(el => getComputedStyle(el).backgroundImage), /\/menu\.png/);
      for (const id of ['btn1v1', 'btn1vUI']) {
        assert(await p.locator(`#${id}`).isVisible());
        assert(await p.locator(`#${id}`).evaluate(el => {
          const b = el.getBoundingClientRect();
          return b.height > 0 && el.classList.contains('hotspot') && document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)?.closest('button') === el;
        }), `${name}: controle sem visual ou área clicável desalinhada: ${id}`);
      }
      assert.equal(await p.locator('#modeScreen h1').count(), 0);
      await p.mouse.move(0, 0);
      await p.evaluate(async () => { await Promise.all([...document.querySelectorAll('.mode-labels image')].map(async el => { const i = new Image(); i.src = el.getAttribute('href'); await i.decode(); })); });
      if (['desktop', 'celular'].includes(name)) await p.screenshot({ path: `${captures}/modos-${name}.png`, animations: 'disabled' });
      const hideBack = await p.addStyleTag({ content: '#btnBack { visibility: hidden !important; }' });
      const modeShot = await p.screenshot({ animations: 'disabled' });
      await hideBack.evaluate(el => el.remove());
      const modeGeometry = await menuGeometry(p, '#modeFrame', ['#btn1v1', '#btn1vUI']);
      assert.deepEqual(modeGeometry, mainGeometry, `${name}: cenário, enquadramento ou botões diferentes do menu`);
      const difference = await labelDifference(p, mainShot, modeShot, mainGeometry.frame);
      assert.equal(difference.outside, 0, `${name}: pixels alterados fora dos rótulos`);
      assert(difference.inside.every(n => n > 0), `${name}: rótulo não substituído`);
      await click(p, '#btnBack'); assert(await p.locator('#menuScreen').isVisible());
      await click(p, '#btnIniciar');
      await click(p, '#btn1v1'); assert.match(await p.locator('#toast').textContent(), /CONSTRUÇÃO/);
      await click(p, '#btn1vUI'); await p.locator('#toast').evaluate(el => el.classList.remove('show'));
      assert.equal(await p.locator('.human-hand button:enabled').count(), 3);
      assert.equal(await p.locator('.opponent-hand .card-art').count(), 3);
      assert.equal(await p.locator('.opponent-hand [data-card-id]').count(), 0);
      assert.deepEqual(await p.locator('.opponent-hand image').evaluateAll(els => els.map(e => e.getAttribute('href'))), Array(3).fill('assets/cards/verso.png'));
      assert.equal(await p.locator('.future-actions button:disabled').count(), 4);
      assert.equal(await p.locator('#btnNewHand').isVisible(), false);
      const initial = await p.locator('.human-hand button').evaluateAll(els => els.map(el => el.dataset.cardId));
      assert.equal(new Set(initial).size, 3);
      // Todas as 40 imagens continuam disponíveis, mesmo fora da mão sorteada.
      assert(await p.evaluate(async () => {
        const { CARD_ASSETS, CARD_BACK } = await import('/js/card-assets.js');
        const ok = await Promise.all([...Object.values(CARD_ASSETS), CARD_BACK].map(async asset => { const i = new Image(); i.src = asset.src; await i.decode(); return i.naturalWidth === asset.width && i.naturalHeight === asset.height; }));
        return ok.length === 41 && ok.every(Boolean);
      }));
      if (original) {
        await click(original, '#btn1vUI');
        const compareStyles = [];
        for (const page of [p, original]) compareStyles.push(await page.addStyleTag({ content: '#gameScreen .card-hand, #gameScreen .card-slot, .demo-notice, #btnNewHand, #toast { visibility: hidden !important; } #gameScreen .card-art { filter: none !important; }' }));
        const currentShot = await p.screenshot({ animations: 'disabled' });
        const oldShot = await original.screenshot({ animations: 'disabled' });
        if (!currentShot.equals(oldShot)) {
          require('node:fs').writeFileSync(`${captures}/compare-current.png`, currentShot);
          require('node:fs').writeFileSync(`${captures}/compare-baseline.png`, oldShot);
        }
        assert(currentShot.equals(oldShot), `${name}: cenário ou controles alterados`);
        for (const style of compareStyles) await style.evaluate(el => el.remove());
      }
      for (let turn = 0; turn < 3; turn++) {
        const card = p.locator('.human-hand button').first();
        const id = await card.getAttribute('data-card-id');
        if (!touch && turn > 0) {
          await card.focus();
          await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
          assert.equal(await card.evaluate(el => el === document.activeElement), true);
          assert.match(await card.getAttribute('aria-label'), /^Jogar /);
          assert.equal(await card.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
          await p.keyboard.press(turn === 1 ? 'Enter' : 'Space');
        } else await click(p, '.human-hand button:first-child');
        assert.equal(await played(), turn * 2 + 1);
        assert.equal(await p.locator('.human-hand button').count(), 2 - turn);
        assert.equal(await p.locator('.human-hand button:enabled').count(), 0);
        assert.equal(await p.locator(`.played-pair:nth-child(${turn + 1}) .card-slot:nth-child(2)`).getAttribute('data-card-id'), id);
        assert.equal(await p.locator(`.human-hand [data-card-id="${id}"]`).count(), 0);
        // Força eventos repetidos num botão desabilitado: não podem jogar outra carta.
        await p.locator('.human-hand').evaluate(el => { const b = el.querySelector('button'); if (b) { b.dispatchEvent(new MouseEvent('click', { bubbles: true })); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
        assert.equal(await played(), turn * 2 + 1);
        if (name === 'pequeno') assert.equal(await p.locator('.card-slot .card-art').first().evaluate(el => getComputedStyle(el).animationName), 'none');
        if (turn === 0 && ['desktop', 'celular'].includes(name)) await p.screenshot({ path: `${captures}/jogada-${name}.png`, animations: 'disabled' });
        await waitPlayed((turn + 1) * 2);
        assert.equal(await p.locator('.opponent-hand .card-art').count(), 2 - turn);
        assert.equal(await p.locator('.human-hand button:enabled').count(), turn === 2 ? 0 : 2 - turn);
      }
      assert.match(await p.locator('#gameStatus').textContent(), /Mão encerrada/);
      assert.equal(await p.locator('#btnNewHand').isVisible(), true);
      assert.equal(await p.locator('.human-hand button').count(), 0);
      const discarded = await p.locator('.card-slot.has-card').evaluateAll(els => els.map(el => el.dataset.cardId));
      assert.equal(new Set(discarded).size, 6);
      if (!touch) assert.equal(await p.locator('#btnNewHand').evaluate(el => el === document.activeElement), true);
      if (['desktop', 'celular'].includes(name)) await p.screenshot({ path: `${captures}/fim-${name}.png`, animations: 'disabled' });
      const bounds = await p.locator('#gameScreen').evaluate(el => [el.clientWidth, el.scrollWidth]);
      assert(bounds[1] <= bounds[0]);
      for (const selector of ['.portrait', '.card-hand', '.future-actions', '#gameTitle', '#btnNewHand']) {
        for (const b of await p.locator(selector).evaluateAll(els => els.map(el => { const b = el.getBoundingClientRect(); return { x: b.x, r: b.right }; }))) assert(b.x >= -1 && b.r <= width + 1, `${name}: ${selector} fora da tela`);
      }
      const feedback = await p.locator('#gameStatus').boundingBox(), restart = await p.locator('#btnNewHand').boundingBox();
      assert(!(feedback.x < restart.x + restart.width && feedback.x + feedback.width > restart.x && feedback.y < restart.y + restart.height && feedback.y + feedback.height > restart.y), `${name}: Nova mão sobrepõe feedback`);
      await click(p, '#btnNewHand'); assert.equal(await played(), 0);
      assert.equal(await p.locator('.human-hand button:enabled').count(), 3);
      assert.equal(await p.locator('.opponent-hand .card-art').count(), 3);
      await click(p, '.human-hand button:first-child');
      await click(p, '#btnGameBack'); assert(await p.locator('#menuScreen').isVisible());
      // Além do relógio falso nos testes unitários, verifica cancelamento no relógio real.
      await p.waitForTimeout(1050); assert.equal(await played(), 0);
      await click(p, '#btnConfig'); await p.locator('#volMusic').fill('25'); await click(p, '#btnSalvar');
      await click(p, '#btnIniciar'); await click(p, '#btn1vUI');
      await p.waitForTimeout(1050); assert.equal(await played(), 0);
      assert.equal(await p.locator('.human-hand button:enabled').count(), 3);
      await click(p, '.human-hand button:first-child'); await click(p, '#btnGameConfig');
      await waitPlayed(2); assert(await p.locator('#modalVeil').isVisible());
      await click(p, '#btnFechar'); assert.equal(await p.locator('.human-hand button:enabled').count(), 2);
      assert.deepEqual(errors, []); assert.deepEqual(bad, []); assert.deepEqual(forbiddenArt, []);
      console.log(`PASS ${name} ${width}x${height}: mesmo cenário e geometria, zero pixels alterados fora dos rótulos, Voltar, imagens indevidas nunca solicitadas, mão completa, entrada ${touch ? 'toque' : 'mouse/teclado'}, bloqueios, seis cartas, nova mão, cancelamento, navegação, sem erros JS${original ? ', regressão visual' : ''}`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
