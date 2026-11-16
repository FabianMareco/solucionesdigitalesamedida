import { checkPassword, passwordConfigured, setSession, clearSession } from '../../../lib/auth';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'DELETE') { clearSession(res); return res.status(200).json({ ok: true }); }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!passwordConfigured()) return res.status(503).json({ error: 'Falta configurar ADMIN_PASSWORD en Vercel' });
  if (!checkPassword(req.body?.password || '')) {
    await new Promise(r => setTimeout(r, 800)); // frena intentos repetidos
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  setSession(res);
  return res.status(200).json({ ok: true });
}
