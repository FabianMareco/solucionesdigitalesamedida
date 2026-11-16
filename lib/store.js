// Datos del panel: clientes y sus trabajos.
// En Vercel usa Postgres (Neon) con DATABASE_URL o POSTGRES_URL.
// Sin esa variable, en desarrollo local guarda todo en .data/admin.json para poder probar.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { STATUSES, CURRENCIES } from './options';

export const CLIENT_FIELDS = ['name', 'business', 'rubro', 'location', 'phone', 'email', 'source', 'notes'];
export const PROJECT_FIELDS = ['client_id', 'title', 'kind', 'status', 'amount', 'currency', 'model_url', 'quote_url', 'date', 'notes'];

const fail = (status, message) => Object.assign(new Error(message), { status });
const str = (v, max = 2000) => (v == null ? null : String(v).trim().slice(0, max) || null);

export function cleanClient(input, partial = false) {
  const out = {};
  for (const f of CLIENT_FIELDS) if (!partial || f in input) out[f] = str(input[f], f === 'notes' ? 8000 : 300);
  if ((!partial || 'name' in input) && !out.name) throw fail(400, 'El cliente necesita un nombre');
  return out;
}

export function cleanProject(input, partial = false) {
  const out = {};
  for (const f of PROJECT_FIELDS) if (!partial || f in input) out[f] = str(input[f], f === 'notes' ? 8000 : 500);
  if ((!partial || 'title' in input) && !out.title) throw fail(400, 'El trabajo necesita un título');
  if (!partial && !out.client_id) throw fail(400, 'Falta el cliente');
  if ('status' in out) out.status = STATUSES.some(s => s.id === out.status) ? out.status : 'prospecto';
  if ('currency' in out && out.currency && !CURRENCIES.includes(out.currency)) out.currency = null;
  if ('amount' in out) {
    if (out.amount == null) out.amount = null;
    else {
      // acepta "350.000", "350.000,50", "1,5" y también "400.5": el punto es de miles solo si separa grupos de 3
      let s = String(out.amount).replace(/[^\d.,-]/g, '');
      if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
      else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
      const n = s ? Number(s) : NaN;
      if (!Number.isFinite(n) || n < 0) throw fail(400, 'El monto tiene que ser un número');
      out.amount = n;
    }
  }
  if ('date' in out && out.date && !/^\d{4}-\d{2}-\d{2}$/.test(out.date)) throw fail(400, 'Fecha inválida');
  for (const f of ['model_url', 'quote_url']) if (out[f] && !/^https?:\/\//i.test(out[f])) out[f] = 'https://' + out[f];
  return out;
}

/* ------------------------------------------------------------------ Postgres */
const dbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

let pg = null;
async function db() {
  if (pg) return pg;
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(dbUrl());
  await sql.query(`CREATE TABLE IF NOT EXISTS clients (
    id text PRIMARY KEY, name text NOT NULL, business text, rubro text, location text, phone text, email text,
    source text, notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
  await sql.query(`CREATE TABLE IF NOT EXISTS projects (
    id text PRIMARY KEY, client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE, title text NOT NULL,
    kind text, status text NOT NULL DEFAULT 'prospecto', amount numeric, currency text, model_url text, quote_url text,
    date date, notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
  pg = sql;
  return sql;
}

const pgStore = {
  async list() {
    const sql = await db();
    const clients = await sql.query('SELECT * FROM clients ORDER BY updated_at DESC');
    const projects = await sql.query(`SELECT id, client_id, title, kind, status, amount::float8 AS amount, currency, model_url, quote_url,
      to_char(date, 'YYYY-MM-DD') AS date, notes, created_at, updated_at FROM projects ORDER BY created_at`);
    return { clients, projects };
  },
  async insert(table, fields, data) {
    const sql = await db();
    const cols = ['id', ...fields];
    const vals = [crypto.randomUUID(), ...fields.map(f => data[f] ?? null)];
    const rows = await sql.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING *`, vals);
    return rows[0];
  },
  async update(table, id, data) {
    const sql = await db();
    const keys = Object.keys(data);
    if (!keys.length) return (await sql.query(`SELECT * FROM ${table} WHERE id = $1`, [id]))[0] || null;
    const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const rows = await sql.query(`UPDATE ${table} SET ${set}, updated_at = now() WHERE id = $1 RETURNING *`, [id, ...keys.map(k => data[k])]);
    return rows[0] || null;
  },
  async remove(table, id) {
    const sql = await db();
    const rows = await sql.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);
    return rows.length > 0;
  },
  async touchClient(id) {
    const sql = await db();
    await sql.query('UPDATE clients SET updated_at = now() WHERE id = $1', [id]);
  },
};

/* ------------------------------------------------------------------ archivo local (solo desarrollo) */
const FILE = path.join(process.cwd(), '.data', 'admin.json');
async function readFile() {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); } catch { return { clients: [], projects: [] }; }
}
async function writeFile(data) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}
const now = () => new Date().toISOString();
const fileStore = {
  async list() {
    const d = await readFile();
    return { clients: [...d.clients].sort((a, b) => b.updated_at.localeCompare(a.updated_at)), projects: d.projects };
  },
  async insert(table, fields, data) {
    const d = await readFile();
    const row = { id: crypto.randomUUID(), ...Object.fromEntries(fields.map(f => [f, data[f] ?? null])), created_at: now(), updated_at: now() };
    d[table].push(row);
    await writeFile(d);
    return row;
  },
  async update(table, id, data) {
    const d = await readFile();
    const row = d[table].find(r => r.id === id);
    if (!row) return null;
    Object.assign(row, data, { updated_at: now() });
    await writeFile(d);
    return row;
  },
  async remove(table, id) {
    const d = await readFile();
    const before = d[table].length;
    d[table] = d[table].filter(r => r.id !== id);
    if (table === 'clients') d.projects = d.projects.filter(p => p.client_id !== id);
    await writeFile(d);
    return d[table].length < before;
  },
  async touchClient(id) {
    const d = await readFile();
    const c = d.clients.find(r => r.id === id);
    if (c) { c.updated_at = now(); await writeFile(d); }
  },
};

/* ------------------------------------------------------------------ elección */
export function storeKind() {
  if (dbUrl()) return 'postgres';
  return process.env.VERCEL ? 'none' : 'file';
}

function store() {
  const k = storeKind();
  if (k === 'postgres') return pgStore;
  if (k === 'file') return fileStore;
  throw fail(503, 'Falta conectar la base de datos: en Vercel, Storage → Create Database → Neon (Postgres), y volver a publicar.');
}

export async function listAll() {
  const { clients, projects } = await store().list();
  return clients.map(c => ({ ...c, projects: projects.filter(p => p.client_id === c.id) }));
}

export const createClient = input => store().insert('clients', CLIENT_FIELDS, cleanClient(input));
export const updateClient = (id, input) => store().update('clients', id, cleanClient(input, true));
export const deleteClient = id => store().remove('clients', id);

export async function createProject(input) {
  const data = cleanProject(input);
  const all = await store().list();
  if (!all.clients.some(c => c.id === data.client_id)) throw fail(400, 'Ese cliente no existe');
  const row = await store().insert('projects', PROJECT_FIELDS, data);
  await store().touchClient(data.client_id);
  return row;
}
export async function updateProject(id, input) {
  const data = cleanProject(input, true);
  delete data.client_id;
  const row = await store().update('projects', id, data);
  if (row) await store().touchClient(row.client_id);
  return row;
}
export const deleteProject = id => store().remove('projects', id);

// Importa clientes con sus trabajos desde un JSON: { clients: [{ ...cliente, projects: [{ ...trabajo }] }] }.
// Un cliente que ya existe (mismo nombre y negocio) se saltea, para que importar dos veces no duplique.
export async function importClients(payload) {
  const list = Array.isArray(payload?.clients) ? payload.clients : null;
  if (!list || !list.length) throw fail(400, 'El archivo no tiene clientes ({ "clients": [...] })');
  if (list.length > 500) throw fail(400, 'Demasiados clientes en un solo archivo (máximo 500)');
  // primero se valida todo, así un error no deja la importación a medias
  const parsed = list.map((c, i) => {
    try {
      return { client: cleanClient(c), projects: (c.projects || []).map(p => cleanProject({ ...p, client_id: 'x' })) };
    } catch (e) { throw fail(400, `Cliente ${i + 1} (${c?.name || 'sin nombre'}): ${e.message}`); }
  });
  const key = c => `${(c.name || '').toLowerCase()}|${(c.business || '').toLowerCase()}`;
  const existing = new Set((await store().list()).clients.map(key));
  const result = { created: [], skipped: [] };
  for (const { client, projects } of parsed) {
    if (existing.has(key(client))) { result.skipped.push(client.name); continue; }
    const row = await store().insert('clients', CLIENT_FIELDS, client);
    for (const p of projects) await store().insert('projects', PROJECT_FIELDS, { ...p, client_id: row.id });
    existing.add(key(client));
    result.created.push(client.name);
  }
  return result;
}
