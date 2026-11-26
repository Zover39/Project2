import { bootstrapStore } from '../../server/store';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const state = bootstrapStore(req.body || {});
  return res.status(200).json(state);
}
