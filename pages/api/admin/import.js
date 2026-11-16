import { withAdmin } from '../../../lib/auth';
import { importClients } from '../../../lib/store';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default withAdmin(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  return res.status(200).json(await importClients(req.body));
});
