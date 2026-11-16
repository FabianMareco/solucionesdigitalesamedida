import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import AdminStyles from '../../components/AdminStyles';
import { isAuthed } from '../../lib/auth';
import { STATUSES, KINDS, CURRENCIES, SOURCES, statusLabel } from '../../lib/options';

export async function getServerSideProps({ req }) {
  if (!isAuthed(req)) return { redirect: { destination: '/admin/login', permanent: false } };
  return { props: {} };
}

/* ------------------------------------------------------------------ utilidades */
const WON = ['aprobado', 'en_curso', 'entregado'];
const OPEN = ['prospecto', 'presupuestado', 'aprobado', 'en_curso'];

const money = (n, cur) => {
  if (n == null || n === '') return '';
  try { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: cur || 'ARS', maximumFractionDigits: 0 }).format(Number(n)); }
  catch { return `${cur || ''} ${Number(n).toLocaleString('es-AR')}`; }
};
const totals = projects => {
  const t = {};
  for (const p of projects) if (p.amount != null && p.amount !== '') t[p.currency || 'ARS'] = (t[p.currency || 'ARS'] || 0) + Number(p.amount);
  return Object.entries(t);
};
const waLink = phone => {
  const d = String(phone || '').replace(/\D/g, '');
  return d ? `https://wa.me/${d}` : null;
};
const fmtDate = d => (d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

async function api(url, method = 'GET', body) {
  const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) { location.href = '/admin/login'; throw new Error('Sesión vencida'); }
  if (!r.ok) throw new Error(data.error || 'Algo salió mal');
  return data;
}

/* ------------------------------------------------------------------ formularios */
const EMPTY_CLIENT = { name: '', business: '', rubro: '', location: '', phone: '', email: '', source: '', notes: '' };
const EMPTY_PROJECT = { title: '', kind: '', status: 'prospecto', amount: '', currency: 'ARS', model_url: '', quote_url: '', date: '', notes: '' };

function Modal({ open, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  // solo Escape cierra desde acá: el evento "close" también salta al cerrarlo por código
  // (al pasar de un formulario a otro) y no debe borrar el formulario siguiente
  return <dialog ref={ref} onCancel={e => { e.preventDefault(); onClose(); }}>{open && children}</dialog>;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function ClientForm({ initial, onSave, onCancel, onDelete }) {
  const [v, setV] = useState({ ...EMPTY_CLIENT, ...initial });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setV(s => ({ ...s, [k]: e.target.value }));
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await onSave(v); } catch (err) { setError(err.message); setBusy(false); }
  }
  return (
    <form className="dlg" onSubmit={submit}>
      <h2>{initial?.id ? 'Editar cliente' : 'Nuevo cliente'}</h2>
      <div className="grid2">
        <Field label="Nombre *"><input value={v.name} onChange={set('name')} required autoFocus placeholder="Ej. Lino" /></Field>
        <Field label="Negocio"><input value={v.business || ''} onChange={set('business')} placeholder="Nombre del negocio o marca" /></Field>
      </div>
      <div className="grid2">
        <Field label="Rubro"><input value={v.rubro || ''} onChange={set('rubro')} placeholder="Ej. gastronomía, estética" /></Field>
        <Field label="Ciudad / país"><input value={v.location || ''} onChange={set('location')} placeholder="Ej. CABA, Argentina" /></Field>
      </div>
      <div className="grid2">
        <Field label="WhatsApp / teléfono"><input value={v.phone || ''} onChange={set('phone')} inputMode="tel" placeholder="Con código de país: 54911…" /></Field>
        <Field label="Email"><input type="email" value={v.email || ''} onChange={set('email')} /></Field>
      </div>
      <Field label="Cómo llegó">
        <select value={v.source || ''} onChange={set('source')}>
          <option value="">—</option>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Notas"><textarea value={v.notes || ''} onChange={set('notes')} placeholder="Lo que te contó, qué necesita, cómo sigue…" /></Field>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="dlg__acts">
        {onDelete && <button type="button" className="btn btn--ghost btn--danger" onClick={onDelete} style={{ marginRight: 'auto' }}>Eliminar cliente</button>}
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}

function ProjectForm({ initial, clientName, onSave, onCancel, onDelete }) {
  const [v, setV] = useState(() => {
    const x = { ...EMPTY_PROJECT, ...initial };
    for (const k of Object.keys(x)) if (x[k] == null) x[k] = '';
    return x;
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setV(s => ({ ...s, [k]: e.target.value }));
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await onSave(v); } catch (err) { setError(err.message); setBusy(false); }
  }
  return (
    <form className="dlg" onSubmit={submit}>
      <h2>{initial?.id ? 'Editar trabajo' : 'Nuevo trabajo'} <span className="muted" style={{ fontWeight: 500 }}>· {clientName}</span></h2>
      <Field label="Qué es *"><input value={v.title} onChange={set('title')} required autoFocus placeholder="Ej. Agenda de turnos con seña" /></Field>
      <div className="grid2">
        <Field label="Tipo">
          <select value={v.kind} onChange={set('kind')}>
            <option value="">—</option>
            {KINDS.map(k => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Estado">
          <select value={v.status} onChange={set('status')}>
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid3">
        <Field label="Presupuesto"><input value={v.amount} onChange={set('amount')} inputMode="decimal" placeholder="Ej. 350000" /></Field>
        <Field label="Moneda">
          <select value={v.currency} onChange={set('currency')}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label="Fecha"><input type="date" value={v.date} onChange={set('date')} /></Field>
      </div>
      <div className="grid2">
        <Field label="Link al modelo / demo"><input value={v.model_url} onChange={set('model_url')} placeholder="https://…" /></Field>
        <Field label="Link al presupuesto"><input value={v.quote_url} onChange={set('quote_url')} placeholder="https://… (PDF, Drive, doc)" /></Field>
      </div>
      <Field label="Notas"><textarea value={v.notes} onChange={set('notes')} placeholder="Alcance, plazos, qué falta, próximo paso…" /></Field>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="dlg__acts">
        {onDelete && <button type="button" className="btn btn--ghost btn--danger" onClick={onDelete} style={{ marginRight: 'auto' }}>Eliminar trabajo</button>}
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}

// notas largas: se ve la primera línea y el resto se abre con "ver más"
function Notes({ text, className }) {
  const [first, ...rest] = text.split('\n');
  const more = rest.join('\n').trim();
  if (!more) return <p className={className}>{first}</p>;
  return (
    <details className={className + ' notes'}>
      <summary>{first} <span className="notes__more">ver más</span></summary>
      <div className="notes__rest">{more}</div>
    </details>
  );
}

/* ------------------------------------------------------------------ panel */
export default function Admin() {
  const router = useRouter();
  const [clients, setClients] = useState(null);
  const [store, setStore] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('todos');
  const [modal, setModal] = useState(null); // { type: 'client'|'project', data, client }

  const load = useCallback(async () => {
    try { const d = await api('/api/admin/clients'); setClients(d.clients); setStore(d.store); setError(''); }
    catch (e) { setError(e.message); setClients(c => c || []); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const all = clients || [];
  const projects = all.flatMap(c => c.projects);
  const stats = useMemo(() => ({
    clients: all.length,
    open: projects.filter(p => OPEN.includes(p.status)).length,
    quoted: totals(projects.filter(p => p.status !== 'perdido')),
    won: totals(projects.filter(p => WON.includes(p.status))),
  }), [clients]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = all.filter(c => {
    const text = [c.name, c.business, c.rubro, c.location, c.notes, ...c.projects.map(p => p.title + ' ' + (p.kind || ''))].join(' ').toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (filter === 'todos') return true;
    if (filter === 'sin_trabajo') return c.projects.length === 0;
    return c.projects.some(p => p.status === filter);
  });

  const close = () => setModal(null);
  async function saveClient(v) {
    if (v.id) { await api(`/api/admin/clients/${v.id}`, 'PUT', v); close(); }
    else {
      const c = await api('/api/admin/clients', 'POST', v);
      // recién creado: seguimos con su primer trabajo
      setModal({ type: 'project', data: {}, client: c });
    }
    await load();
  }
  async function removeClient(c) {
    if (!confirm(`¿Eliminar a ${c.name} y todos sus trabajos? No se puede deshacer.`)) return;
    await api(`/api/admin/clients/${c.id}`, 'DELETE'); close(); await load();
  }
  async function saveProject(v, client) {
    if (v.id) await api(`/api/admin/projects/${v.id}`, 'PUT', v);
    else await api('/api/admin/projects', 'POST', { ...v, client_id: client.id });
    close(); await load();
  }
  async function removeProject(p) {
    if (!confirm(`¿Eliminar el trabajo "${p.title}"?`)) return;
    await api(`/api/admin/projects/${p.id}`, 'DELETE'); close(); await load();
  }
  async function quickStatus(p, status) {
    setClients(cs => cs.map(c => ({ ...c, projects: c.projects.map(x => (x.id === p.id ? { ...x, status } : x)) })));
    try { await api(`/api/admin/projects/${p.id}`, 'PUT', { status }); await load(); } catch (e) { setError(e.message); load(); }
  }
  async function importFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const r = await api('/api/admin/import', 'POST', data);
      await load();
      setNotice([
        r.created.length ? `Importados: ${r.created.join(', ')}.` : 'No se importó ningún cliente nuevo.',
        r.skipped.length ? `Ya estaban cargados: ${r.skipped.join(', ')}.` : '',
      ].filter(Boolean).join(' '));
    } catch (err) {
      setError(err instanceof SyntaxError ? 'Ese archivo no es un JSON válido' : err.message);
    }
  }
  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.replace('/admin/login');
  }

  const counts = Object.fromEntries(STATUSES.map(s => [s.id, all.filter(c => c.projects.some(p => p.status === s.id)).length]));

  return (
    <>
      <Head>
        <title>Panel · Clientes y trabajos</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <AdminStyles />

      <header className="top">
        <div className="wrap top__bar">
          <div>
            <p className="muted top__kicker">Soluciones Digitales a Medida · Panel</p>
            <h1 className="display top__title">Clientes y trabajos</h1>
          </div>
          <div className="top__acts">
            <a className="btn btn--ghost btn--sm" href="/" target="_blank" rel="noopener">Ver la web</a>
            <button className="btn btn--ghost btn--sm" onClick={logout}>Salir</button>
            <label className="btn btn--sm">
              Importar
              <input type="file" accept="application/json,.json" onChange={importFile} hidden />
            </label>
            <button className="btn btn--primary" onClick={() => setModal({ type: 'client', data: {} })}>+ Cliente</button>
          </div>
        </div>
      </header>

      <main className="wrap main">
        {store === 'file' && <p className="note">Modo local: los datos se guardan en <code>.data/admin.json</code>. En Vercel se usan los de la base de datos.</p>}
        {error && <p className="err" role="alert">{error}</p>}
        {notice && <p className="ok" role="status">{notice} <button className="linkbtn" onClick={() => setNotice('')}>Cerrar</button></p>}

        <section className="stats" aria-label="Resumen">
          <div className="stat"><b>{stats.clients}</b><span>clientes</span></div>
          <div className="stat"><b>{stats.open}</b><span>trabajos abiertos</span></div>
          <div className="stat">
            <b>{stats.quoted.length ? stats.quoted.map(([c, n]) => <span key={c}>{money(n, c)}</span>) : '—'}</b>
            <span>presupuestado (sin contar los no concretados)</span>
          </div>
          <div className="stat">
            <b>{stats.won.length ? stats.won.map(([c, n]) => <span key={c}>{money(n, c)}</span>) : '—'}</b>
            <span>ganado (aprobado, en curso, entregado)</span>
          </div>
        </section>

        <section className="tools">
          <input className="search" type="search" placeholder="Buscar cliente, negocio, trabajo…" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar" />
          <div className="chips" role="group" aria-label="Filtrar por estado">
            <button className={'chip' + (filter === 'todos' ? ' is-on' : '')} onClick={() => setFilter('todos')}>Todos <i>{all.length}</i></button>
            {STATUSES.filter(s => counts[s.id]).map(s => (
              <button key={s.id} className={'chip' + (filter === s.id ? ' is-on' : '')} onClick={() => setFilter(s.id)}>{s.label} <i>{counts[s.id]}</i></button>
            ))}
            {all.some(c => !c.projects.length) && (
              <button className={'chip' + (filter === 'sin_trabajo' ? ' is-on' : '')} onClick={() => setFilter('sin_trabajo')}>Sin trabajo cargado</button>
            )}
          </div>
        </section>

        {clients === null && <p className="muted">Cargando…</p>}
        {clients && !all.length && !error && (
          <div className="empty">
            <h2>Todavía no hay clientes</h2>
            <p className="muted">Empezá por los que ya captaste: cargá su nombre, y después el trabajo con su modelo y su presupuesto, aunque no se haya concretado.</p>
            <button className="btn btn--primary" onClick={() => setModal({ type: 'client', data: {} })}>+ Cargar el primer cliente</button>
          </div>
        )}
        {clients && all.length > 0 && !visible.length && <p className="muted">Nada coincide con la búsqueda.</p>}

        <div className="list">
          {visible.map(c => (
            <article key={c.id} className="client">
              <div className="client__head">
                <div className="client__id">
                  <h2>{c.name}{c.business && <span className="muted"> · {c.business}</span>}</h2>
                  <p className="muted client__meta">
                    {[c.rubro, c.location, c.source && `llegó por ${c.source}`].filter(Boolean).join(' · ') || 'Sin datos extra'}
                  </p>
                  <p className="client__contact">
                    {waLink(c.phone) && <a href={waLink(c.phone)} target="_blank" rel="noopener">WhatsApp</a>}
                    {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
                  </p>
                </div>
                <div className="client__acts">
                  <button className="btn btn--sm" onClick={() => setModal({ type: 'project', data: {}, client: c })}>+ Trabajo</button>
                  <button className="btn btn--sm btn--ghost" onClick={() => setModal({ type: 'client', data: c })}>Editar</button>
                </div>
              </div>
              {c.notes && <Notes text={c.notes} className="client__notes" />}
              {c.projects.length > 0 ? (
                <ul className="projects">
                  {c.projects.map(p => (
                    <li key={p.id} className="project">
                      <div className="project__main">
                        <b>{p.title}</b>
                        <span className="muted">{[p.kind, fmtDate(p.date)].filter(Boolean).join(' · ')}</span>
                        {p.notes && <Notes text={p.notes} className="project__notes" />}
                        <span className="project__links">
                          {p.model_url && <a href={p.model_url} target="_blank" rel="noopener">Ver modelo ↗</a>}
                          {p.quote_url && <a href={p.quote_url} target="_blank" rel="noopener">Ver presupuesto ↗</a>}
                        </span>
                      </div>
                      <div className="project__side">
                        <span className="project__amount">{money(p.amount, p.currency) || <span className="muted">sin monto</span>}</span>
                        <label className={`pill st-${p.status} statusSel`}>
                          <span className="sr">Estado</span>
                          {statusLabel(p.status)}
                          <select value={p.status} onChange={e => quickStatus(p, e.target.value)} aria-label={`Estado de ${p.title}`}>
                            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </label>
                        <button className="btn btn--sm btn--ghost" onClick={() => setModal({ type: 'project', data: p, client: c })}>Editar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted none">Sin trabajos cargados. <button className="linkbtn" onClick={() => setModal({ type: 'project', data: {}, client: c })}>Cargar el modelo o el presupuesto</button></p>
              )}
            </article>
          ))}
        </div>
      </main>

      <Modal open={modal?.type === 'client'} onClose={close}>
        {modal?.type === 'client' && (
          <ClientForm initial={modal.data} onSave={saveClient} onCancel={close} onDelete={modal.data.id ? () => removeClient(modal.data) : null} />
        )}
      </Modal>
      <Modal open={modal?.type === 'project'} onClose={close}>
        {modal?.type === 'project' && (
          <ProjectForm
            key={modal.data.id || 'new-' + modal.client.id}
            initial={modal.data}
            clientName={modal.client.name}
            onSave={v => saveProject(v, modal.client)}
            onCancel={close}
            onDelete={modal.data.id ? () => removeProject(modal.data) : null}
          />
        )}
      </Modal>

      <style jsx>{`
        .top { background: var(--card); border-bottom: 1px solid var(--line); }
        .top__bar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding-top: 20px; padding-bottom: 16px; flex-wrap: wrap; }
        .top__kicker { margin: 0 0 4px; font-size: 13px; }
        .top__title { margin: 0; font-size: clamp(32px, 6vw, 48px); color: var(--deep); }
        .top__acts { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .main { display: grid; gap: 20px; padding-top: 20px; padding-bottom: 64px; }
        .note { margin: 0; font-size: 13px; color: var(--muted); }
        .ok { margin: 0; background: #e1f3e8; color: #14532d; border: 1px solid #b9dfc8; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
        .stats { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 820px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .stat { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; display: grid; gap: 2px; align-content: start; }
        .stat b { font-size: 24px; line-height: 1.15; display: grid; color: var(--deep); overflow-wrap: anywhere; }
        .stat > span { font-size: 13px; color: var(--muted); }
        .tools { display: grid; gap: 10px; }
        .search { width: 100%; min-height: 44px; padding: 0 14px; border: 1px solid var(--line-strong); border-radius: 10px; background: #fff; }
        .chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .chip { min-height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--card); cursor: pointer; font-size: 13px; font-weight: 600; }
        .chip i { font-style: normal; color: var(--muted); margin-left: 4px; }
        .chip.is-on { background: var(--deep); border-color: var(--deep); color: #fff; }
        .chip.is-on i { color: #f3c9c0; }
        .empty { background: var(--card); border: 1px dashed var(--line-strong); border-radius: 16px; padding: 32px 20px; text-align: center; display: grid; gap: 8px; justify-items: center; }
        .empty h2 { margin: 0; }
        .empty p { margin: 0 0 8px; max-width: 46ch; }
        .list { display: grid; gap: 14px; }
        .client { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; display: grid; gap: 10px; }
        .client__head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
        .client__id h2 { margin: 0; font-size: 20px; }
        .client__meta { margin: 2px 0 0; font-size: 14px; }
        .client__contact { margin: 4px 0 0; display: flex; gap: 14px; flex-wrap: wrap; font-size: 14px; font-weight: 600; }
        .client__acts { display: flex; gap: 6px; }
        :global(.client__notes) { margin: 0; font-size: 14px; white-space: pre-wrap; background: var(--bg); border-radius: 10px; padding: 10px 12px; }
        .projects { list-style: none; margin: 0; padding: 0; display: grid; }
        .project { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-top: 1px solid var(--line); flex-wrap: wrap; }
        .project__main { display: grid; gap: 2px; min-width: 0; flex: 1 1 260px; }
        .project__main > span { font-size: 14px; }
        :global(.project__notes) { white-space: pre-wrap; color: var(--ink); margin: 2px 0 0; font-size: 14px; }
        :global(.notes summary) { cursor: pointer; list-style: none; }
        :global(.notes summary::-webkit-details-marker) { display: none; }
        :global(.notes__more) { color: var(--accent); font-weight: 600; white-space: nowrap; }
        :global(.notes[open] .notes__more) { display: none; }
        :global(.notes__rest) { margin-top: 6px; white-space: pre-wrap; }
        .project__links { display: flex; gap: 14px; flex-wrap: wrap; font-weight: 600; }
        .project__links:empty { display: none; }
        .project__side { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .project__amount { font-weight: 700; font-variant-numeric: tabular-nums; }
        .statusSel { position: relative; cursor: pointer; }
        .statusSel select { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
        .statusSel:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }
        .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
        .none { margin: 0; font-size: 14px; }
        .linkbtn { background: none; border: 0; padding: 0; color: var(--accent); font-weight: 600; cursor: pointer; text-decoration: underline; }
      `}</style>
    </>
  );
}
