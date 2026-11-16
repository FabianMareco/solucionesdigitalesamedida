// Estilos del panel, con la paleta y las fuentes de la web.
export default function AdminStyles() {
  return (
    <style jsx global>{`
      @font-face { font-family: "Hanken Grotesk"; font-style: normal; font-display: swap; font-weight: 100 900;
        src: url(/assets/fonts/hanken-grotesk-latin-wght-normal.woff2) format("woff2"); }
      @font-face { font-family: "Big Shoulders Display"; font-style: normal; font-display: swap; font-weight: 100 900;
        src: url(/assets/fonts/big-shoulders-display-latin-wght-normal.woff2) format("woff2"); }
      :root {
        --bg: #fbf7f6; --card: #ffffff; --ink: #2a0a0a; --muted: #6f4a46; --line: #ecdcd8; --line-strong: #d8bcb6;
        --accent: #b10f2e; --accent-ink: #ffffff; --deep: #570000; --soft: #fbe7e2; --ok: #1f7a4a; --warn: #9a6200;
        color-scheme: light;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; background: var(--bg); color: var(--ink); }
      body { font-family: "Hanken Grotesk", system-ui, sans-serif; font-size: 15px; line-height: 1.45; -webkit-font-smoothing: antialiased; }
      a { color: var(--accent); }
      button, input, select, textarea { font: inherit; color: inherit; }
      .wrap { max-width: 1120px; margin: 0 auto; padding: 0 16px; }
      .display { font-family: "Big Shoulders Display", "Hanken Grotesk", sans-serif; text-transform: uppercase; letter-spacing: .01em; font-weight: 800; line-height: .95; }

      .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; padding: 0 16px; border-radius: 10px;
        border: 1px solid var(--line-strong); background: var(--card); cursor: pointer; font-weight: 600; text-decoration: none; color: var(--ink); white-space: nowrap; }
      .btn:hover { border-color: var(--muted); }
      .btn--primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
      .btn--primary:hover { background: var(--deep); border-color: var(--deep); }
      .btn--ghost { border-color: transparent; background: transparent; }
      .btn--sm { min-height: 32px; padding: 0 10px; font-size: 13px; border-radius: 8px; }
      .btn--danger { color: var(--accent); }
      .btn:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

      .field { display: grid; gap: 4px; }
      .field > span { font-size: 13px; font-weight: 600; color: var(--muted); }
      .field input, .field select, .field textarea { width: 100%; min-height: 40px; padding: 8px 10px; border: 1px solid var(--line-strong); border-radius: 8px; background: #fff; }
      .field textarea { min-height: 84px; resize: vertical; }
      .grid2 { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
      .grid3 { display: grid; gap: 12px; grid-template-columns: 2fr 1fr 1fr; }
      @media (max-width: 560px) { .grid2, .grid3 { grid-template-columns: 1fr; } }

      .err { background: var(--soft); color: var(--deep); border: 1px solid var(--line-strong); padding: 10px 12px; border-radius: 8px; font-size: 14px; }
      .muted { color: var(--muted); }
      .pill { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
      .pill::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
      .st-prospecto { background: #f1ece9; color: #6f4a46; }
      .st-presupuestado { background: #fff1d6; color: var(--warn); }
      .st-aprobado { background: #e6f0ff; color: #2456a6; }
      .st-en_curso { background: #ede5ff; color: #5b34b0; }
      .st-entregado { background: #e1f3e8; color: var(--ok); }
      .st-pausado { background: #eeeeee; color: #555; }
      .st-perdido { background: #f6e3e3; color: #8c2b2b; }

      dialog { border: 0; border-radius: 16px; padding: 0; width: min(640px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); color: var(--ink);
        box-shadow: 0 20px 60px rgba(40, 0, 0, .25); }
      dialog::backdrop { background: rgba(42, 10, 10, .45); }
      .dlg { display: grid; gap: 14px; padding: 20px; }
      .dlg h2 { margin: 0; font-size: 20px; }
      .dlg__acts { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
    `}</style>
  );
}
