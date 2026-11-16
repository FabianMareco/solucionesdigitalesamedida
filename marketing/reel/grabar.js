// Graba la escena cuadro por cuadro (30 fps) moviendo el reloj con seek(), para que no haya saltos ni cuadros perdidos.
// uso: node grabar.js <almacen.html> <carpeta-salida> [lado-en-px]
const { chromium } = require('playwright');
const path = require('path');
const [html, out, sideArg] = process.argv.slice(2);
const side = Number(sideArg || 1080), FPS = 30;
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: side, height: side }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(html) + '?embed&inspect&finish=miniature');
  await p.waitForFunction(() => window.__world && window.__world.runtime);
  const dur = await p.evaluate(() => { const w = window.__world; w.runtime.setPaused(true); return w.definition.duration; });
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.__world.runtime.seek(t), i / FPS);
    await p.screenshot({ path: path.join(out, `f${String(i).padStart(4, '0')}.png`) });
  }
  console.log('cuadros', n, 'errores', errs);
  await b.close();
})();
