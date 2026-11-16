# Soluciones Digitales a Medida

Sitio de Fabián Mareco, servido con Next.js.

Los archivos de `public/` son los originales del borrador (HTML, CSS, JS de motion, fuentes e imágenes).
Next.js los sirve y mapea las rutas:

- `/` → `public/index.html`
- `/servicios` → `public/servicios.html`

## Panel de administración (`/admin`)

Registro de clientes y sus trabajos: estado (prospecto, presupuesto enviado, aprobado, en curso, entregado,
pausado, no se concretó), presupuesto con moneda, link al modelo y al presupuesto, y notas.

Configuración en Vercel (una sola vez):

1. **Base de datos**: Storage → Create Database → **Neon (Postgres)** → conectarla a este proyecto.
   Eso agrega `DATABASE_URL` sola. Las tablas se crean solas en el primer uso.
2. **Contraseña**: Settings → Environment Variables → `ADMIN_PASSWORD` = la que elijas.
   Opcional: `ADMIN_SECRET` = una cadena larga al azar (firma la sesión; si cambia, se cierran todas las sesiones).
3. Volver a publicar (Deployments → Redeploy) para que tome las variables.

En desarrollo local, sin `DATABASE_URL`, el panel guarda en `.data/admin.json` (ignorado por git):

```bash
ADMIN_PASSWORD=algo npm run dev
```

## Desarrollo

```bash
npm install
npm run dev
```

## Contacto

`public/assets/site.js` → `CONTACT` (WhatsApp y email) y `T` (la pauta de escritura que llega prellenada en el
mensaje, en ES / EN / PT).
