import { withAdmin } from '../../../../lib/auth';
import { createProject } from '../../../../lib/store';

export default withAdmin(async (req, res) => {
  if (req.method === 'POST') return res.status(201).json(await createProject(req.body || {}));
  return res.status(405).json({ error: 'Método no permitido' });
});
