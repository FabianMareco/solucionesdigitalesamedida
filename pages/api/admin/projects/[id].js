import { withAdmin } from '../../../../lib/auth';
import { updateProject, deleteProject } from '../../../../lib/store';

export default withAdmin(async (req, res) => {
  const { id } = req.query;
  if (req.method === 'PUT') {
    const row = await updateProject(id, req.body || {});
    return row ? res.status(200).json(row) : res.status(404).json({ error: 'No existe' });
  }
  if (req.method === 'DELETE') return (await deleteProject(id)) ? res.status(200).json({ ok: true }) : res.status(404).json({ error: 'No existe' });
  return res.status(405).json({ error: 'Método no permitido' });
});
