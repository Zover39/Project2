import { getUsers, updateUserById } from '../../server/store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ users: getUsers() });
  }

  if (req.method === 'PATCH') {
    const { id, ...patch } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Требуется id пользователя' });
    }
    const updated = updateUserById(id, { id, ...patch });
    return res.status(200).json({ user: updated });
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
