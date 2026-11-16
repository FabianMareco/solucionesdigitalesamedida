import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminStyles from '../../components/AdminStyles';
import { isAuthed, passwordConfigured } from '../../lib/auth';

export async function getServerSideProps({ req }) {
  if (isAuthed(req)) return { redirect: { destination: '/admin', permanent: false } };
  return { props: { configured: passwordConfigured() } };
}

export default function Login({ configured }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) router.replace('/admin');
    else setError(data.error || 'No se pudo entrar');
  }

  return (
    <>
      <Head>
        <title>Entrar · Panel</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <AdminStyles />
      <main className="login">
        <form onSubmit={submit} className="login__card">
          <p className="muted login__kicker">Soluciones Digitales a Medida</p>
          <h1 className="display login__title">Panel</h1>
          {!configured && <p className="err">Falta configurar la variable <b>ADMIN_PASSWORD</b> en Vercel (Settings → Environment Variables) y volver a publicar.</p>}
          <label className="field">
            <span>Contraseña</span>
            <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} autoFocus disabled={!configured} />
          </label>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn btn--primary" disabled={busy || !configured || !password}>{busy ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </main>
      <style jsx>{`
        .login { min-height: 100dvh; display: grid; place-items: center; padding: 16px; }
        .login__card { width: min(380px, 100%); display: grid; gap: 14px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 28px 24px; }
        .login__kicker { margin: 0; font-size: 13px; }
        .login__title { margin: 0 0 4px; font-size: 48px; color: var(--deep); }
      `}</style>
    </>
  );
}
