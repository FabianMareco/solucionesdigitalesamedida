// Exporta la animación de bang-motion cuadro por cuadro (sin perder cuadros), con el Playwright instalado.
// node exportar.cjs stills 0.5,2,5 salida/   |   node exportar.cjs video 30 salida/frames
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [mode, arg, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'index.html') + '?clean=1');
  await p.waitForFunction('window.OPENER && window.OPENER.ready');
  const seek = t => p.evaluate(async t => { window.OPENER.seek(t); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);
  const ts = mode === 'stills' ? arg.split(',').map(Number) : Array.from({ length: Math.round(15 * +arg) }, (_, i) => i / +arg);
  for (let i = 0; i < ts.length; i++) { await seek(ts[i]); await p.screenshot({ path: mode === 'stills' ? `${out}/t${ts[i].toFixed(2)}.png` : `${out}/f${String(i).padStart(5, '0')}.png` }); }
  await b.close();
})();
