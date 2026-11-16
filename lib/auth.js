// Sesión del panel: una cookie firmada (HMAC) que vence a los 30 días.
// Variables de entorno: ADMIN_PASSWORD (obligatoria) y ADMIN_SECRET (opcional, para firmar la cookie).
import crypto from 'node:crypto';

const COOKIE = 'sdam_admin';
const MAX_AGE = 60 * 60 * 24 * 30;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || '';
const sign = value => crypto.createHmac('sha256', secret()).update(value).digest('base64url');

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const passwordConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(input) {
  if (!passwordConfigured()) return false;
  // se comparan los hash para que la comparación no dependa del largo de la contraseña
  const h = s => crypto.createHash('sha256').update(String(s)).digest('hex');
  return safeEqual(h(input), h(process.env.ADMIN_PASSWORD));
}

function readCookie(req) {
  const raw = req.headers.cookie || '';
  const part = raw.split(/;\s*/).find(c => c.startsWith(COOKIE + '='));
  return part ? decodeURIComponent(part.slice(COOKIE.length + 1)) : '';
}

export function isAuthed(req) {
  if (!passwordConfigured()) return false;
  const [exp, sig] = readCookie(req).split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

const cookieFlags = maxAge =>
  `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}` + (process.env.NODE_ENV === 'production' ? '; Secure' : '');

export function setSession(res) {
  const exp = String(Date.now() + MAX_AGE * 1000);
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(exp + '.' + sign(exp))}; ${cookieFlags(MAX_AGE)}`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieFlags(0)}`);
}

// Envuelve un handler de la API: sin sesión válida responde 401.
export const withAdmin = handler => async (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ error: 'No autorizado' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    return await handler(req, res);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ error: e.status ? e.message : 'Error del servidor: ' + e.message });
  }
};
