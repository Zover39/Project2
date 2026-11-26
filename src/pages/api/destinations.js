import { getDestinations, setDestinations } from '../../server/store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ destinations: getDestinations() });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { destinations } = req.body || {};
    if (!Array.isArray(destinations)) {
      return res.status(400).json({ error: 'Требуется массив destinations' });
    }
    return res.status(200).json({ destinations: setDestinations(destinations) });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
