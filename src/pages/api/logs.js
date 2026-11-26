import { addLog, getLogs } from '../../server/store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ logs: getLogs() });
  }

  if (req.method === 'POST') {
    const { action, details, type } = req.body || {};
    if (!action) {
      return res.status(400).json({ error: 'Требуется поле action' });
    }
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      action,
      details: details || '',
      type: type || 'INFO',
      createdAt: new Date().toISOString()
    };
    addLog(entry);
    return res.status(201).json({ log: entry });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
