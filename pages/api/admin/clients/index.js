import { withAdmin } from '../../../../lib/auth';
import { listAll, createClient, storeKind } from '../../../../lib/store';

export default withAdmin(async (req, res) => {
  if (req.method === 'GET') return res.status(200).json({ clients: await listAll(), store: storeKind() });
  if (req.method === 'POST') return res.status(201).json(await createClient(req.body || {}));
  return res.status(405).json({ error: 'Método no permitido' });
});
